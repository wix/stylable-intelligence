import path from 'path';
import { safeParse, process, Diagnostic as StylableDiagnostic, Stylable } from '@stylable/core';
import { Diagnostic, Range } from 'vscode-languageserver-types';
import { URI } from 'vscode-uri';

export function createDiagnosis(content: string, fullPath: string, stylable: Stylable): Diagnostic[] {
    if (!fullPath.endsWith('.st.css')) {
        return [];
    }
    const file = URI.parse(fullPath).fsPath;

    const docPostCSSRoot = safeParse(content, { from: path.resolve(file) });
    const meta = process(docPostCSSRoot);

    stylable.fileProcessor.add(file, meta);

    try {
        stylable.transform(meta);
    } catch {
        /**/
    }
    return meta.diagnostics.reports
        .concat(meta.transformDiagnostics ? meta.transformDiagnostics.reports : [])
        .map(reportToDiagnostic);

    // stylable diagnostic to protocol diagnostic
    function reportToDiagnostic(report: StylableDiagnostic) {
        const severity = report.type === 'error' ? 1 : 2;
        const range = createRange(report);
        return Diagnostic.create(range, report.message, severity);
    }
}

function createRange(report: StylableDiagnostic) {
    const source = report.node.source;
    const start = { line: 0, character: 0 };
    const end = { line: 0, character: 0 };
    if (report.options.word && source) {
        const lines: string[] = (source.input as any).css.split('\n');
        const searchStart = source.start!.line - 1;
        const searchEnd = source.end!.line - 1;
        for (let i = searchStart; i <= searchEnd; ++i) {
            const wordIndex = lines[i].indexOf(report.options.word!);
            if (!!~wordIndex) {
                start.line = i;
                start.character = wordIndex;
                end.line = i;
                end.character = wordIndex + report.options.word!.length;
                break;
            }
        }
    } else if (source) {
        start.line = source.start!.line - 1;
        start.character = source.start!.column - 1;
        end.line = source.end!.line - 1;
        end.character = source.end!.column;
    }
    return Range.create(start, end);
}
