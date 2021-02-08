import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import { docsUrl, pipeableSelect } from '../utils'

export const ruleName = 'select-style'

export const methodSelectMessageId = 'methodSelect'
export const operatorSelectMessageId = 'operatorSelect'

export type MessageIds =
  | typeof methodSelectMessageId
  | typeof operatorSelectMessageId

export const OPERATOR = 'operator'
export const METHOD = 'method'

type Options = [{ mode: string }]

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: ruleName,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description: `Selectors can be used either with 'select' as a pipeable operator or as a method`,
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          mode: {
            enum: [OPERATOR, METHOD],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [methodSelectMessageId]:
        'Selectors should be used with select method: this.store.select(selector)',
      [operatorSelectMessageId]:
        'Selectors should be used with the pipeable operator: this.store.pipe(select(selector))',
    },
  },
  defaultOptions: [{ mode: METHOD }],
  create: (context, [{ mode }]) => {
    return {
      [`ClassProperty ${pipeableSelect}`](node: TSESTree.CallExpression) {
        if (mode === METHOD) {
          context.report({
            node,
            messageId: methodSelectMessageId,
          })
        }
      },
      [`ClassProperty CallExpression MemberExpression > Identifier[name='select']`](
        node: TSESTree.Identifier,
      ) {
        if (mode === OPERATOR) {
          context.report({
            node,
            messageId: operatorSelectMessageId,
          })
        }
      },
    }
  },
})
