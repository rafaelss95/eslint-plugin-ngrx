import { ASTUtils, ESLintUtils } from '@typescript-eslint/experimental-utils'
import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils'
import { onFunctionWithoutType, docsUrl } from '../utils'

export const ruleName = 'on-function-explicit-return-type'

export const onFunctionExplicitReturnType = 'onFunctionExplicitReturnType'
export const onFunctionExplicitReturnTypeSuggest =
  'onFunctionExplicitReturnTypeSuggest'
export type MessageIds =
  | typeof onFunctionExplicitReturnType
  | typeof onFunctionExplicitReturnTypeSuggest

type Options = []

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: ruleName,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description: 'On function should have an explicit return type',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      [onFunctionExplicitReturnType]:
        'On functions should have an explicit return type when using arrow functions, `on(action, (state): State => {}`.',
      [onFunctionExplicitReturnTypeSuggest]: 'Add explicit return type.',
    },
  },
  defaultOptions: [],
  create: (context) => {
    const sourceCode = context.getSourceCode()

    return {
      [onFunctionWithoutType](node: TSESTree.ArrowFunctionExpression) {
        context.report({
          suggest: [
            {
              fix: (fixer) => getFixes(node, sourceCode, fixer),
              messageId: onFunctionExplicitReturnTypeSuggest,
            },
          ],
          node,
          messageId: onFunctionExplicitReturnType,
        })
      },
    }
  },
})

function getFixes(
  node: TSESTree.ArrowFunctionExpression,
  sourceCode: Readonly<TSESLint.SourceCode>,
  fixer: TSESLint.RuleFixer,
): TSESLint.RuleFix | TSESLint.RuleFix[] {
  const { params } = node
  const [firstParam] = params
  const [lastParam] = params.slice(-1)
  const previousToken = sourceCode.getTokenBefore(firstParam)
  const isParenthesized =
    previousToken && ASTUtils.isOpeningParenToken(previousToken)

  if (isParenthesized) {
    const nextToken = sourceCode.getTokenAfter(lastParam)

    return fixer.insertTextAfter(nextToken ?? lastParam, ': State')
  }

  return [
    fixer.insertTextBefore(firstParam, '('),
    fixer.insertTextAfter(lastParam, '): State'),
  ]
}
