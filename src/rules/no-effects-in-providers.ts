import { ASTUtils, ESLintUtils } from '@typescript-eslint/experimental-utils'
import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils'
import {
  docsUrl,
  ngModuleDecorator,
  ngModuleImports,
  ngModuleProviders,
} from '../utils'

export const ruleName = 'no-effects-in-providers'

export const messageId = 'noEffectsInProviders'
export type MessageIds = typeof messageId

type Options = []

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: ruleName,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description:
        'An Effect should not be listed as a provider if it is added to the EffectsModule',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      [messageId]:
        'The Effect should not be listed as a provider if it is added to the EffectsModule',
    },
  },
  defaultOptions: [],
  create: (context) => {
    const sourceCode = context.getSourceCode()
    const effectsInProviders: TSESTree.Identifier[] = []
    const effectsInImports = new Set<string>()

    return {
      [ngModuleProviders](node: TSESTree.Identifier) {
        effectsInProviders.push(node)
      },
      [ngModuleImports](node: TSESTree.Identifier) {
        effectsInImports.add(node.name)
      },
      [`${ngModuleDecorator}:exit`]() {
        effectsInProviders
          .filter(({ name }) => effectsInImports.has(name))
          .forEach((effect) =>
            context.report({
              fix: (fixer) =>
                fixer.removeRange(getRemoveRangeFor(effect, sourceCode)),
              node: effect,
              messageId,
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
  const previousToken = sourceCode.getTokenBefore(node)
  const nextToken = sourceCode.getTokenAfter(node)
  const isCommaPreviousToken =
    previousToken && ASTUtils.isCommaToken(previousToken)
  const isCommaNextToken = nextToken && ASTUtils.isCommaToken(nextToken)
  const isLastProperty = isCommaPreviousToken && !isCommaNextToken

  return [
    (isLastProperty && previousToken?.range[0]) || node.range[0],
    (isCommaNextToken && nextToken?.range[1]) || node.range[1],
  ]
}
