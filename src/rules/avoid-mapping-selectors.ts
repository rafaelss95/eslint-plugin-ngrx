import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import {
  docsUrl,
  isCallExpression,
  isIdentifier,
  pipeExpression,
  selectOperator,
} from '../utils'

export const ruleName = 'avoid-mapping-selectors'

export const messageId = 'avoidMapppingSelectors'
export type MessageIds = typeof messageId

type Options = []

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: ruleName,
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Best Practices',
      description:
        'Prefer mapping a selector at the selector level, in the projector method of `createSelector`',
      recommended: 'warn',
    },
    schema: [],
    messages: {
      [messageId]:
        'Map the value of a selector in the projection method of `createSelector`',
    },
  },
  defaultOptions: [],
  create: (context) => {
    const pipeSelectSelector = `CallExpression[${pipeExpression}]:has(${selectOperator})`
    const storeSelectSelector = `CallExpression[callee.object.callee.property.name='select'][${pipeExpression}]`

    return {
      [`ClassProperty :matches(${pipeSelectSelector}, ${storeSelectSelector})`]({
        arguments: operators,
      }: TSESTree.CallExpression) {
        operators.filter(isMapOperator).forEach((node) =>
          context.report({
            node,
            messageId,
          }),
        )
      },
    }
  },
})

function isMapOperator(operator: TSESTree.Expression): boolean {
  return (
    isCallExpression(operator) &&
    isIdentifier(operator.callee) &&
    operator.callee.name === 'map'
  )
}
