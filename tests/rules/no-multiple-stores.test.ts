import { stripIndent } from 'common-tags'
import rule, {
  noMultipleStores,
  noMultipleStoresSuggest,
  ruleName,
} from '../../src/rules/no-multiple-stores'
import { ruleTester } from '../utils'

ruleTester().run(ruleName, rule, {
  valid: [
    `export class NoCtorOK {}`,
    `
    export class EmptyOk {
      constructor() {}
    }`,
    `
    export class OneWithVisibilityOk {
      constructor(private store: Store) {}
    }`,
    `
    export class OneWithoutVisibilityOk {
      constructor(store: Store) {}
    }`,
    `
    export class OnePlusExtraOk {
      constructor(private store: Store, data: Service) {}
    }`,
  ],
  invalid: [
    {
      code: stripIndent`
        export class NotOk1 {
          constructor(store: Store, store2: Store) {}
        }`,
      errors: [
        {
          column: 15,
          endColumn: 27,
          line: 2,
          messageId: noMultipleStores,
          suggestions: [
            {
              messageId: noMultipleStoresSuggest,
              output: stripIndent`
              export class NotOk1 {
                constructor( store2: Store) {}
              }`,
            },
          ],
        },
        {
          column: 29,
          endColumn: 42,
          line: 2,
          messageId: noMultipleStores,
          suggestions: [
            {
              messageId: noMultipleStoresSuggest,
              output: stripIndent`
              export class NotOk1 {
                constructor(store: Store) {}
              }`,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        export class NotOk2 {
          constructor(store: Store, private readonly actions$: Actions, private store2: Store, b: B) {}
        }`,
      errors: [
        {
          column: 15,
          endColumn: 27,
          line: 2,
          messageId: noMultipleStores,
          suggestions: [
            {
              messageId: noMultipleStoresSuggest,
              output: stripIndent`
              export class NotOk2 {
                constructor( private readonly actions$: Actions, private store2: Store, b: B) {}
              }`,
            },
          ],
        },
        {
          column: 73,
          endColumn: 86,
          line: 2,
          messageId: noMultipleStores,
          suggestions: [
            {
              messageId: noMultipleStoresSuggest,
              output: stripIndent`
              export class NotOk2 {
                constructor(store: Store, private readonly actions$: Actions,  b: B) {}
              }`,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        export class NotOk3 {
          constructor(
            a: A, store: Store, private readonly actions$: Actions, private store2: Store, private readonly store3: Store,
          ) {}
        }`,
      errors: [
        {
          column: 11,
          endColumn: 23,
          line: 3,
          messageId: noMultipleStores,
          suggestions: [
            {
              messageId: noMultipleStoresSuggest,
              output: stripIndent`
              export class NotOk3 {
                constructor(
                  a: A,  private readonly actions$: Actions, private store2: Store, private readonly store3: Store,
                ) {}
              }`,
            },
          ],
        },
        {
          column: 69,
          endColumn: 82,
          line: 3,
          messageId: noMultipleStores,
          suggestions: [
            {
              messageId: noMultipleStoresSuggest,
              output: stripIndent`
              export class NotOk3 {
                constructor(
                  a: A, store: Store, private readonly actions$: Actions,  private readonly store3: Store,
                ) {}
              }`,
            },
          ],
        },
        {
          column: 101,
          endColumn: 114,
          line: 3,
          messageId: noMultipleStores,
          suggestions: [
            {
              messageId: noMultipleStoresSuggest,
              output: stripIndent`
              export class NotOk3 {
                constructor(
                  a: A, store: Store, private readonly actions$: Actions, private store2: Store, 
                ) {}
              }`,
            },
          ],
        },
      ],
    },
  ],
})
