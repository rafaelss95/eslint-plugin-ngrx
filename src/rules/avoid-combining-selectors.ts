import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'

import {
  docsUrl,
  isCallExpression,
  isMemberExpression,
  isIdentifier,
} from '../utils'

export const ruleName = 'avoid-combining-selectors'

export const messageId = 'avoidCombiningSelectors'
export type MessageIds = typeof messageId

type Options = []

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: ruleName,
  meta: {
    type: 'suggestion',
    docs: {
      category: 'Best Practices',
      description:
        'Prefer combining selectors at the selector level with `createSelector`',
      recommended: 'warn',
    },
    schema: [],
    messages: {
      [messageId]:
        'Combine selectors at the selector level with createSelector',
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      [`ClassProperty CallExpression[callee.name='combineLatest'][arguments.length > 1]`]({
        arguments: operators,
      }: TSESTree.CallExpression) {
        const [, ...violations] = operators.filter(
          (operator) =>
            isCallExpression(operator) &&
            isMemberExpression(operator.callee) &&
            isMemberExpression(operator.callee.object) &&
            isIdentifier(operator.callee.object.property) &&
            isIdentifier(operator.callee.property) &&
            (operator.callee.property.name === 'select' ||
              (operator.callee.property.name === 'pipe' &&
                operator.arguments.some(isSelectOperator))),
        )

        for (const node of violations) {
          context.report({
            node,
            messageId,
          })
        }
      },
    }
  },
})

function isSelectOperator(operator: TSESTree.Expression) {
  return (
    isCallExpression(operator) &&
    isIdentifier(operator.callee) &&
    operator.callee.name === 'select'
  )
}
