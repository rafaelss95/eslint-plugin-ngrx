import { stripIndent } from 'common-tags'
import rule, {
  noReducerInKeyNames,
  noReducerInKeyNamesSuggest,
  ruleName,
} from '../../src/rules/no-reducer-in-key-names'
import { ruleTester } from '../utils'

ruleTester().run(ruleName, rule, {
  valid: [
    `
    @NgModule({
      imports: [
        StoreModule.forRoot({
          foo,
          persons: personsReducer,
          'people': peopleReducer,
        }),
      ],
    })
    export class AppModule {}`,
    `
    @NgModule({
      imports: [
        StoreModule.forFeature({
          foo,
          persons: personsReducer,
          'people': peopleReducer,
        }),
      ],
    })
    export class AppModule {}`,
    `
    export const reducers: ActionReducerMap<AppState> = {
      foo,
      persons: personsReducer,
      'people': peopleReducer,
    };`,
  ],
  invalid: [
    {
      code: stripIndent`
        @NgModule({
          imports: [
            StoreModule.forRoot({
              feeReducer,
            }),
          ],
        })
        export class AppModule {}`,
      errors: [
        {
          column: 7,
          endColumn: 17,
          line: 4,
          messageId: noReducerInKeyNames,
          suggestions: [
            {
              messageId: noReducerInKeyNamesSuggest,
              output: stripIndent`
                @NgModule({
                  imports: [
                    StoreModule.forRoot({
                      fee,
                    }),
                  ],
                })
                export class AppModule {}`,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        @NgModule({
          imports: [
            StoreModule.forFeature({
              'fooReducer': foo,
            }),
          ],
        })
        export class AppModule {}`,
      errors: [
        {
          column: 7,
          endColumn: 19,
          line: 4,
          messageId: noReducerInKeyNames,
          suggestions: [
            {
              messageId: noReducerInKeyNamesSuggest,
              output: stripIndent`
                @NgModule({
                  imports: [
                    StoreModule.forFeature({
                      'foo': foo,
                    }),
                  ],
                })
                export class AppModule {}`,
            },
          ],
        },
      ],
    },
    {
      code: stripIndent`
        export const reducers: ActionReducerMap<AppState> = {
          feereducer,
          'reducerFoo': foo,
        };`,
      errors: [
        {
          column: 3,
          endColumn: 13,
          line: 2,
          messageId: noReducerInKeyNames,
          suggestions: [
            {
              messageId: noReducerInKeyNamesSuggest,
              output: stripIndent`
                export const reducers: ActionReducerMap<AppState> = {
                  fee,
                  'reducerFoo': foo,
                };`,
            },
          ],
        },
        {
          column: 3,
          endColumn: 15,
          line: 3,
          messageId: noReducerInKeyNames,
          suggestions: [
            {
              messageId: noReducerInKeyNamesSuggest,
              output: stripIndent`
                export const reducers: ActionReducerMap<AppState> = {
                  feereducer,
                  'Foo': foo,
                };`,
            },
          ],
        },
      ],
    },
  ],
})
