import { ESLintUtils } from '@typescript-eslint/experimental-utils'
import type { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils'
import {
  docsUrl,
  findClassDeclarationNode,
  findImportDeclarationNode,
  getConditionalImportFix,
  pipeableSelect,
  storeSelect,
} from '../utils'

export const ruleName = 'select-style'

export const methodSelectMessageId = 'methodSelect'
export const operatorSelectMessageId = 'operatorSelect'
const storeModulePath = '@ngrx/store'

export type MessageIds =
  | typeof methodSelectMessageId
  | typeof operatorSelectMessageId
export const enum SelectStyle {
  Method = 'method',
  Operator = 'operator',
}
type MemberExpressionWithProperty = Omit<
  TSESTree.MemberExpression,
  'property'
> & {
  property: TSESTree.Identifier
}
type CallExpression = Omit<TSESTree.CallExpression, 'parent'> & {
  callee: MemberExpressionWithProperty
  parent: TSESTree.CallExpression & {
    callee: Omit<TSESTree.MemberExpression, 'object'> & {
      object: MemberExpressionWithProperty
    }
  }
}
type Options = [{ mode: SelectStyle }]

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: ruleName,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description: `Selectors can be used either with 'select' as a pipeable operator or as a method`,
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          mode: {
            enum: [SelectStyle.Method, SelectStyle.Operator],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [methodSelectMessageId]:
        'Selectors should be used with select method: `this.store.select(selector)`',
      [operatorSelectMessageId]:
        'Selectors should be used with the pipeable operator: `this.store.pipe(select(selector))`',
    },
  },
  defaultOptions: [{ mode: SelectStyle.Method }],
  create: (context, [{ mode }]) => {
    const sourceCode = context.getSourceCode()

    return {
      [pipeableSelect](node: CallExpression) {
        if (mode !== SelectStyle.Method) return

        context.report({
          fix: (fixer) => getOperatorToMethodFixes(node, sourceCode, fixer),
          node: node.callee,
          messageId: methodSelectMessageId,
        })
      },
      [storeSelect](node: CallExpression) {
        if (mode !== SelectStyle.Operator) return

        context.report({
          fix: (fixer) => getMethodToOperatorFixes(node, fixer),
          node: node.callee.property,
          messageId: operatorSelectMessageId,
        })
      },
    }
  },
})

function getMethodToOperatorFixes(
  node: CallExpression,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix[] {
  const classDeclaration = findClassDeclarationNode(node)

  if (!classDeclaration) return []

  const importDeclaration = findImportDeclarationNode(
    classDeclaration,
    storeModulePath,
  )

  return getConditionalImportFix(
    fixer,
    importDeclaration,
    'select',
    storeModulePath,
  ).concat(
    fixer.insertTextBefore(node.callee.property, 'pipe('),
    fixer.insertTextAfter(node, ')'),
  )
}

function getOperatorToMethodFixes(
  node: CallExpression,
  sourceCode: Readonly<TSESLint.SourceCode>,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix[] {
  const { parent } = node
  const pipeContainsOnlySelect = parent.arguments.length === 1

  if (pipeContainsOnlySelect) {
    const pipeRange: TSESTree.Range = [
      parent.callee.property.range[0],
      parent.callee.property.range[1] + 1,
    ]
    const trailingParenthesisRange: TSESTree.Range = [
      parent.range[1] - 1,
      parent.range[1],
    ]

    return [
      fixer.removeRange(pipeRange),
      fixer.removeRange(trailingParenthesisRange),
    ]
  }

  const text = sourceCode.getText(node)
  const nextToken = sourceCode.getTokenAfter(node)
  const selectOperatorRange: TSESTree.Range = [
    node.range[0],
    nextToken?.range[1] ?? node.range[1],
  ]
  const storeRange = parent.callee.object.range

  return [
    fixer.removeRange(selectOperatorRange),
    fixer.insertTextAfterRange(storeRange, `.${text}`),
  ]
}
