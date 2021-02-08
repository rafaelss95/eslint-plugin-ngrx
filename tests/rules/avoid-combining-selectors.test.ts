import { stripIndent } from 'common-tags'
import { fromFixture } from 'eslint-etc'
import rule, {
  messageId,
  ruleName,
} from '../../src/rules/avoid-combining-selectors'
import { ruleTester } from '../utils'

ruleTester().run(ruleName, rule, {
  valid: [
    `const test = (someType: SomeType) => someType.pipe(select(selectItems))`,
    `const test = (someType: SomeType) => someType.select(selectItems).pipe()`,
    `class FixtureComponent { vm$ = this.store.select(({ customers }) => customers) }`,
    `class FixtureComponent { vm$ = this.store.select(selectItems) }`,
    `class FixtureComponent { vm$ = combineLatest(this.store.select(selectItems), this.somethingElse()) }`,
    `class FixtureComponent { vm$ = combineLatest(this.somethingElse(), this.store.select(selectItems)) }`,
  ],
  invalid: [
    fromFixture(
      stripIndent`
      class FixtureComponent {
        vm$ = combineLatest(this.store$.select(selectItems), this.store$.select(selectOtherItems))
                                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~           [${messageId}]
      }`,
    ),
    fromFixture(
      stripIndent`
      class FixtureComponent {
        vm$ = combineLatest(this.store.select(selectItems), this.store2.pipe(select(selectOtherItems)), this.somethingElse())
                                                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~      [${messageId}]
      }`,
    ),
    fromFixture(
      stripIndent`
      class FixtureComponent {
        vm$ = combineLatest(this.store.pipe(select(selectItems)), this.store.pipe(select(selectOtherItems)), this.somethingElse())
                                                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ [${messageId}]
      }`,
    ),
  ],
})
