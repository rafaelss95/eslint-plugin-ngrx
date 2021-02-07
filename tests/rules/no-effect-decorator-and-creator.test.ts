import { stripIndent } from 'common-tags'
import { fromFixture } from 'eslint-etc'
import rule, {
  noEffectDecoratorAndCreator,
  noEffectDecoratorAndCreatorSuggest,
  ruleName,
} from '../../src/rules/no-effect-decorator-and-creator'
import { ruleTester } from '../utils'

ruleTester().run(ruleName, rule, {
  valid: [
    stripIndent`
      @Injectable()
      export class FixtureEffects {
        creator = createEffect(() => this.actions)

        constructor(private actions: Actions) {}
      }`,
    stripIndent`
      @Injectable()
      export class FixtureEffects {
        @Effect({ dispatch: false })
        decorator = this.actions

        constructor(private actions: Actions) {}
      }`,
  ],
  invalid: [
    fromFixture(
      stripIndent`
        @Injectable()
        export class FixtureEffects {
          @Effect()
          both = createEffect(() => this.actions)
          ~~~~ [${noEffectDecoratorAndCreator}]

          constructor(private actions: Actions) {}
        }`,
      {
        output: stripIndent`
          @Injectable()
          export class FixtureEffects {
            
            both = createEffect(() => this.actions)

            constructor(private actions: Actions) {}
          }`,
      },
    ),
    {
      code: stripIndent`
        @Injectable()
        export class FixtureEffects {
          @Effect({ dispatch: false })
          both = createEffect(() => this.actions)

          constructor(private actions: Actions) {}
        }`,
      errors: [
        {
          column: 3,
          endColumn: 7,
          line: 4,
          messageId: noEffectDecoratorAndCreator,
          suggestions: [
            {
              messageId: noEffectDecoratorAndCreatorSuggest,
              output: stripIndent`
              @Injectable()
              export class FixtureEffects {
                
                both = createEffect(() => this.actions)

                constructor(private actions: Actions) {}
              }`,
            },
          ],
        },
      ],
    },
  ],
})
