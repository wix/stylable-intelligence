import * as asserters from '../test-kit/asserters';
import { createRange, ProviderRange } from '../src/completion-providers';
import { Completion } from '../src/completion-types';

describe('States', function () {

    describe('Prefixes', function () {

        const str1 = ':hello';
        const str2 = ':goodbye';

        [str1, str2].forEach((str, j, a) => {
            str.split('').forEach((c, i) => {
                let prefix = str.slice(0, i);
                const createComp = (str: string, rng: ProviderRange, path: string) => asserters.stateCompletion(str.slice(1), rng, path);

                it('should complete available states from same file, with prefix ' + prefix + ' ', function () {
                    let rng = createRange(4, 5, 4, 5 + i);
                    return asserters.getCompletions('states/class-with-states.css', prefix).then((asserter) => {
                        let exp: Partial<Completion>[] = [];
                        let notExp: Partial<Completion>[] = [];

                        exp.push(createComp(a[j], rng, './states/class-with-states.css'));
                        if (prefix.length <= 1) {
                            exp.push(createComp(a[1 - j], rng, './states/class-with-states.css'));
                        } else {
                            notExp.push(createComp(a[1 - j], rng, './states/class-with-states.css'));
                        }

                        asserter.suggested(exp);
                        asserter.notSuggested(notExp);
                    });
                });

                it('should complete available states after in complex selectors, with prefix ' + prefix + ' ', function () {
                    let rng = createRange(9, 19, 9, 19 + i);
                    return asserters.getCompletions('states/complex-selectors.css', prefix).then((asserter) => {
                        let exp: Partial<Completion>[] = [];
                        let notExp: Partial<Completion>[] = [];

                        if (str === str1) {
                            exp.push(createComp(str1, rng, './states/complex-selectors.css'));
                        } else if (prefix.length <= 1) {
                            exp.push(createComp(str1, rng, './states/complex-selectors.css'));
                        }
                        notExp.push(createComp(str2, rng, './states/complex-selectors.css'));

                        asserter.suggested(exp);
                        asserter.notSuggested(notExp);
                    });
                });

                xit('should complete available states in complex selectors ending in state name, with prefix ' + prefix + ' ', function () {
                    return asserters.getCompletions('states/complex-selectors-with-states.css', prefix).then((asserter) => {
                        asserter.suggested([
                            asserters.stateCompletion('hello', createRange(9, 25, 9, 26), 'states/complex-selectors-with-states.css')
                        ]);
                        asserter.notSuggested([
                            asserters.stateCompletion('holla', createRange(9, 25, 9, 26), 'states/complex-selectors-with-states.css'),
                        ]);
                    });
                });
            });
        });
    });



    it('should not complete available states after : in complex selectors if existing', function () {
        return asserters.getCompletions('states/complex-selectors-with-states-existing.css').then((asserter) => {
            asserter.suggested([
                asserters.stateCompletion('goodbye', createRange(4, 11, 4, 12), 'states/complex-selectors-with-states-existing.css')
            ]);
            asserter.notSuggested([
                asserters.stateCompletion('hello', createRange(0, 0, 0, 0))
            ]);
        });
    });

    it('should not complete state value after :: ', function () {
        return asserters.getCompletions('states/class-with-states-double-colon.css').then((asserter) => {
            asserter.notSuggested([
                asserters.stateCompletion('hello', createRange(0, 0, 0, 0)),
                asserters.stateCompletion('goodbye', createRange(0, 0, 0, 0))
            ]);
        });
    });

    it('should complete state value for default import used as tag', function () {
        return asserters.getCompletions('pseudo-elements/default-import-as-tag.st.css').then((asserter) => {
            asserter.suggested([
                asserters.stateCompletion('state', createRange(6, 4, 6, 4), 'pseudo-elements/import.st.css'),
                asserters.stateCompletion('otherState', createRange(6, 4, 6, 4), 'pseudo-elements/import.st.css')
            ]);
        });
    });

    it('should complete state value for local class extending default import', function () {
        return asserters.getCompletions('pseudo-elements/default-import-extended.st.css').then((asserter) => {
            asserter.suggested([
                asserters.stateCompletion('state', createRange(10, 5, 10, 5), 'pseudo-elements/import.st.css'),
                asserters.stateCompletion('otherState', createRange(10, 5, 10, 5), 'pseudo-elements/import.st.css')
            ]);
        });
    });

    it('should complete state value for local class extending named import', function () {
        return asserters.getCompletions('pseudo-elements/named-import-extended-named.st.css').then((asserter) => {
            asserter.suggested([
                asserters.stateCompletion('anotherState', createRange(9, 5, 9, 5), 'pseudo-elements/import.st.css'),
            ]);
            asserter.notSuggested([
                asserters.stateCompletion('state', createRange(9, 5, 9, 5), 'pseudo-elements/import.st.css'),
                asserters.stateCompletion('otherState', createRange(9, 5, 9, 5), 'pseudo-elements/import.st.css')
            ]);
        });
    });

    it('should complete pseudo-element states if pseudo-element is present', function () {
        return asserters.getCompletions('pseudo-elements/recursive-import-3.st.css').then((asserter) => {
            asserter.suggested([
                asserters.stateCompletion('state', createRange(10, 11, 10, 11), 'pseudo-elements/recursive-import-1.st.css'),
                asserters.stateCompletion('otherState', createRange(10, 11, 10, 11), 'pseudo-elements/recursive-import-1.st.css')
            ]);
            asserter.notSuggested([
                asserters.stateCompletion('anotherState', createRange(10, 11, 10, 11), 'pseudo-elements/recursive-import-1.st.css'),
            ]);
        });
    });

    it('should complete pseudo-element more than one pseudo-element state', function () {
        return asserters.getCompletions('pseudo-elements/multiple-states.st.css').then((asserter) => {
            asserter.suggested([
                asserters.stateCompletion('oneMoreState', createRange(9, 25, 9, 25), 'pseudo-elements/import.st.css'),
            ]);
            asserter.notSuggested([
                asserters.stateCompletion('state', createRange(9, 25, 9, 25), 'pseudo-elements/import.st.css'),
                asserters.stateCompletion('otherState', createRange(9, 25, 9, 25), 'pseudo-elements/import.st.css')
            ]);
        });
    });
})
