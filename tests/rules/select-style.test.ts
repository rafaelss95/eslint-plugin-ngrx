import { stripIndent } from 'common-tags'
import { fromFixture } from 'eslint-etc'
import rule, {
  operatorSelectMessageId,
  methodSelectMessageId,
  ruleName,
  SelectStyle,
} from '../../src/rules/select-style'
import { ruleTester } from '../utils'

ruleTester().run(ruleName, rule, {
  valid: [
    `this.store.select(selector);`,
    {
      code: `this.store.pipe(select(selector));`,
      options: [{ mode: SelectStyle.Operator }],
    },
    {
      code: `this.store.select(selector);`,
      options: [{ mode: SelectStyle.Method }],
    },
  ],
  invalid: [
    fromFixture(
      stripIndent`
        this.store.pipe(select(selector));
                        ~~~~~~ [${methodSelectMessageId}]
      `,
      {
        output: stripIndent`
          this.store.select(selector);

        `,
      },
    ),
    fromFixture(
      stripIndent`
        this.store.pipe(select(selector, selector2), filter(Boolean));
                        ~~~~~~ [${methodSelectMessageId}]
      `,
      {
        options: [{ mode: SelectStyle.Method }],
        output: stripIndent`
          this.store.select(selector, selector2).pipe( filter(Boolean));

        `,
      },
    ),
    fromFixture(
      stripIndent`
        @Component({ selector: 'app-test', template: '' })
        class FixtureComponent {
          readonly test$ = this.store.select(selector);
                                      ~~~~~~ [${operatorSelectMessageId}]
        }
      `,
      {
        options: [{ mode: SelectStyle.Operator }],
        output: stripIndent`
          import { select } from '@ngrx/store';
          @Component({ selector: 'app-test', template: '' })
          class FixtureComponent {
            readonly test$ = this.store.pipe(select(selector));
          }
        `,
      },
    ),
    fromFixture(
      stripIndent`
        import { Store } from '@ngrx/store';

        @Component({ selector: 'app-test', template: '' })
        class FixtureComponent {
          readonly test$ = this.store.select(selector);
                                      ~~~~~~ [${operatorSelectMessageId}]
        }
      `,
      {
        options: [{ mode: SelectStyle.Operator }],
        output: stripIndent`
          import { Store, select } from '@ngrx/store';

          @Component({ selector: 'app-test', template: '' })
          class FixtureComponent {
            readonly test$ = this.store.pipe(select(selector));
          }
        `,
      },
    ),
    fromFixture(
      stripIndent`
        import { select, Store } from '@ngrx/store';

        @Component({ selector: 'app-test', template: '' })
        class FixtureComponent {
          readonly test$ = this.store.select(selector, selector2);
                                      ~~~~~~ [${operatorSelectMessageId}]
        }
      `,
      {
        options: [{ mode: SelectStyle.Operator }],
        output: stripIndent`
          import { select, Store } from '@ngrx/store';

          @Component({ selector: 'app-test', template: '' })
          class FixtureComponent {
            readonly test$ = this.store.pipe(select(selector, selector2));
          }
        `,
      },
    ),
  ],
})
