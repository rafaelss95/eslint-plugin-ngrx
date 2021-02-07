import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import {
  docsUrl,
  effectCreator,
  effectDecorator,
  getDecorator,
  getDecoratorArgument,
} from '../utils'

export const ruleName = 'no-effect-decorator-and-creator'

export const noEffectDecoratorAndCreator = 'noEffectDecoratorAndCreator'
export const noEffectDecoratorAndCreatorSuggest =
  'noEffectDecoratorAndCreatorSuggest'
export type MessageIds =
  | typeof noEffectDecoratorAndCreator
  | typeof noEffectDecoratorAndCreatorSuggest

type Options = []

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: ruleName,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description:
        'An Effect should only use the effect creator (`createEffect`) or the effect decorator (`@Effect`), but not both simultaneously',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      [noEffectDecoratorAndCreator]:
        'Remove the `@Effect` decorator or the `createEffect` creator function',
      [noEffectDecoratorAndCreatorSuggest]: 'Remove the `@Effect` decorator',
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      [`${effectCreator}:has(${effectDecorator})`](
        node: TSESTree.ClassProperty,
      ) {
        const decorator = getDecorator(node, 'Effect')

        if (!decorator) return

        const decoratorArgument = getDecoratorArgument(decorator)

        context.report({
          ...(decoratorArgument
            ? {
                // We suggest (instead of fixing) the removal of `@Effect`,
                // because as the configuration argument was defined, the correction
                // can cause unexpected behavior, since the settings may differ and to do
                // this treatment here would be, in addition to costly, not guaranteed.
                suggest: [
                  {
                    fix: (fixer) => fixer.remove(decorator),
                    messageId: noEffectDecoratorAndCreatorSuggest,
                  },
                ],
              }
            : {
                fix: (fixer) => fixer.remove(decorator),
              }),
          node: node.key,
          messageId: noEffectDecoratorAndCreator,
        })
      },
    }
  },
})
