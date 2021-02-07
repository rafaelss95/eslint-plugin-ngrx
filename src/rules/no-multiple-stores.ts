import { ASTUtils, ESLintUtils } from '@typescript-eslint/experimental-utils'
import type { TSESTree, TSESLint } from '@typescript-eslint/experimental-utils'
import {
  constructorExit,
  docsUrl,
  injectedStore,
  isTSParameterProperty,
} from '../utils'

export const ruleName = 'no-multiple-stores'

export const noMultipleStores = 'noMultipleStores'
export const noMultipleStoresSuggest = 'noMultipleStoresSuggest'
export type MessageIds =
  | typeof noMultipleStores
  | typeof noMultipleStoresSuggest

type Options = []

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: ruleName,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description: 'There should only be one store injected',
      recommended: 'error',
    },
    schema: [],
    messages: {
      [noMultipleStores]: 'Store should be injected only once',
      [noMultipleStoresSuggest]: 'Remove this injection.',
    },
  },
  defaultOptions: [],
  create: (context) => {
    const sourceCode = context.getSourceCode()
    const injectedStores: TSESTree.Identifier[] = []

    return {
      [injectedStore](node: TSESTree.Identifier) {
        injectedStores.push(node)
      },
      [constructorExit]() {
        if (injectedStores.length <= 1) return

        injectedStores.forEach((node) =>
          context.report({
            suggest: [
              {
                fix: (fixer) =>
                  fixer.removeRange(getRemoveRangeFor(node, sourceCode)),
                messageId: noMultipleStoresSuggest,
              },
            ],
            node,
            messageId: noMultipleStores,
          }),
        )
      },
    }
  },
})

function getRemoveRangeFor(
  node: TSESTree.Identifier,
  sourceCode: Readonly<TSESLint.SourceCode>,
): TSESTree.Range {
  const { parent } = node
  const nodeToRemove = parent && isTSParameterProperty(parent) ? parent : node
  const previousToken = sourceCode.getTokenBefore(nodeToRemove)
  const nextToken = sourceCode.getTokenAfter(nodeToRemove)
  const isCommaPreviousToken =
    previousToken && ASTUtils.isCommaToken(previousToken)
  const isCommaNextToken = nextToken && ASTUtils.isCommaToken(nextToken)
  const isLastProperty = isCommaPreviousToken && !isCommaNextToken

  return [
    (isLastProperty && previousToken?.range[0]) || nodeToRemove.range[0],
    (isCommaNextToken && nextToken?.range[1]) || nodeToRemove.range[1],
  ]
}
