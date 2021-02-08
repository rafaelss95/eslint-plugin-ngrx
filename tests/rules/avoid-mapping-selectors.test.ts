import { stripIndent } from 'common-tags'
import { fromFixture } from 'eslint-etc'
import rule, {
  messageId,
  ruleName,
} from '../../src/rules/avoid-mapping-selectors'
import { ruleTester } from '../utils'

ruleTester().run(ruleName, rule, {
  valid: [
    `const test = (someType: SomeType) => someType.pipe(select(selectItems), map(Boolean))`,
    `const test = (someType: SomeType) => someType.select(selectItems).pipe(map(Boolean))`,
    `class FixtureComponent { vm$ = this.store.select(({ customers }) => customers) }`,
    `class FixtureComponent { vm$ = this.store.select(selectItems) }`,
    `class FixtureComponent { vm$ = this.store.select(selectItems).pipe(filter(Boolean)) }`,
    `class FixtureComponent { vm$ = this.store.pipe(select(selectItems)) }`,
  ],
  invalid: [
    fromFixture(
      stripIndent`
        class FixtureComponent {
          vm$ = this.store2.select(selectItems).pipe(map(x => ({name: x.name})))
                                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~     [${messageId}]
        }
      `,
    ),
    fromFixture(
      stripIndent`
        class FixtureComponent {
          vm$ = this.store$.select(selectItems).pipe(filter(x => !!x), map(toName))
                                                                       ~~~~~~~~~~~  [${messageId}]
        }
      `,
    ),
    fromFixture(
      stripIndent`
        class FixtureComponent {
          vm$ = this.store.pipe(select(user), map(({ name }) => name))
                                              ~~~~~~~~~~~~~~~~~~~~~~~               [${messageId}]
        }
      `,
    ),
    fromFixture(
      stripIndent`
        class FixtureComponent {
          vm$ = this.store.pipe(select(user)).pipe(map(Boolean))
                                                   ~~~~~~~~~~~~                     [${messageId}]
        }
      `,
    ),
  ],
})
