import { stripIndent } from 'common-tags'
import { fromFixture } from 'eslint-etc'
import rule, {
  METHOD,
  methodSelectMessageId,
  OPERATOR,
  operatorSelectMessageId,
  ruleName,
} from '../../src/rules/select-style'
import { ruleTester } from '../utils'

ruleTester().run(ruleName, rule, {
  valid: [
    `const test = (someType: SomeType) => someType.pipe(select(selectItems), map(Boolean))`,
    `class FixtureComponent { vm$ = this.store.select(selector) }`,
    {
      code: `const test = (someType: SomeType) => someType.select(selectItems).pipe(map(Boolean))`,
      options: [{ mode: OPERATOR }],
    },
    {
      code: `class FixtureComponent { vm$ = this.store2.select(selector) }`,
      options: [{ mode: METHOD }],
    },
    {
      code: `class FixtureComponent { vm$ = this.store$.pipe(select(selector)) }`,
      options: [{ mode: OPERATOR }],
    },
  ],
  invalid: [
    fromFixture(
      stripIndent`
      class FixtureComponent {
        vm$ = this.store.pipe(select(selector));
                              ~~~~~~~~~~~~~~~~    [${methodSelectMessageId}]
      }`,
    ),
    fromFixture(
      stripIndent`
      class FixtureComponent {
        vm$ = this.store.select(({ customers }) => customers)
                         ~~~~~~                   [${operatorSelectMessageId}]
      }`,
      { options: [{ mode: OPERATOR }] },
    ),
    fromFixture(
      stripIndent`
      class FixtureComponent {
        vm$ = this.store2.pipe(select(selector));
                               ~~~~~~~~~~~~~~~~   [${methodSelectMessageId}]
      }`,
      { options: [{ mode: METHOD }] },
    ),
    fromFixture(
      stripIndent`
      class FixtureComponent {
        vm$ = this.store$.select(selector);
                          ~~~~~~                  [${operatorSelectMessageId}]
      }`,
      { options: [{ mode: OPERATOR }] },
    ),
  ],
})
