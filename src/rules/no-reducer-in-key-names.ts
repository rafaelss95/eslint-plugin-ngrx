import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils'
import { isIdentifier, isLiteral } from 'eslint-etc'
import { actionReducerMap, docsUrl, storeActionReducerMap } from '../utils'

export const ruleName = 'no-reducer-in-key-names'

export const noReducerInKeyNames = 'noReducerInKeyNames'
export const noReducerInKeyNamesSuggest = 'noReducerInKeyNamesSuggest'
export type MessageIds =
  | typeof noReducerInKeyNames
  | typeof noReducerInKeyNamesSuggest

type Options = []

const reducerKeyword = 'reducer'

export default ESLintUtils.RuleCreator(docsUrl)<Options, MessageIds>({
  name: ruleName,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description: `Avoid the word "${reducerKeyword}" in the key names`,
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      [noReducerInKeyNames]: `Avoid the word "${reducerKeyword}" in the key names to better represent the state.`,
      [noReducerInKeyNamesSuggest]: `Remove the word "${reducerKeyword}".`,
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      [`${storeActionReducerMap}, ${actionReducerMap}`]({
        key,
      }: TSESTree.Property) {
        const keyName = getKeyName(key)

        if (!keyName || !containsReducerKeyword(keyName)) return

        context.report({
          suggest: [
            {
              fix: (fixer) =>
                fixer.replaceText(
                  key,
                  keyName.replace(RegExp(reducerKeyword, 'i'), ''),
                ),
              messageId: noReducerInKeyNamesSuggest,
            },
          ],
          node: key,
          messageId: noReducerInKeyNames,
        })
      },
    }
  },
})

function getKeyName(key: TSESTree.Expression): string | null {
  if (isLiteral(key)) {
    return key.raw
  }

  if (isIdentifier(key)) {
    return key.name
  }

  return null
}

function containsReducerKeyword(name: string): boolean {
  return name.toLowerCase().includes(reducerKeyword)
}
