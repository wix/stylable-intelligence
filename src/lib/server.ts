import fs from '@file-services/node';
import { Stylable } from '@stylable/core';
import {
    createConnection,
    IConnection,
    IPCMessageReader,
    IPCMessageWriter,
    DidChangeConfigurationNotification,
    TextDocuments
} from 'vscode-languageserver';

import { initializeResult } from './capabilities';
import { VscodeStylableLanguageService } from './vscode-service';
import { wrapFs } from './wrap-fs';

const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

connection.listen();
connection.onInitialize(params => {
    const docs = new TextDocuments();
    const wrappedFs = wrapFs(fs, docs);

    const vscodeStylableLSP = new VscodeStylableLanguageService(
        connection,
        docs,
        wrappedFs,
        new Stylable(params.rootPath || '', wrappedFs as any, require)
    );

    docs.listen(connection);
    docs.onDidChangeContent(vscodeStylableLSP.createDiagnosticsHandler());
    docs.onDidClose(vscodeStylableLSP.onDidClose());

    connection.onCompletion(vscodeStylableLSP.onCompletion.bind(vscodeStylableLSP));
    connection.onDefinition(vscodeStylableLSP.onDefinition.bind(vscodeStylableLSP));
    connection.onHover(vscodeStylableLSP.onHover.bind(vscodeStylableLSP));
    connection.onReferences(vscodeStylableLSP.onReferences.bind(vscodeStylableLSP));
    connection.onDocumentColor(vscodeStylableLSP.onDocumentColor.bind(vscodeStylableLSP));
    connection.onColorPresentation(vscodeStylableLSP.onColorPresentation.bind(vscodeStylableLSP));
    connection.onRenameRequest(vscodeStylableLSP.onRenameRequest.bind(vscodeStylableLSP));
    connection.onSignatureHelp(vscodeStylableLSP.onSignatureHelp.bind(vscodeStylableLSP));
    connection.onDidChangeConfiguration(vscodeStylableLSP.createDiagnosticsHandler());

    // connection.onDocumentFormatting(stylableLSP.onDocumentFormatting.bind(stylableLSP));

    return initializeResult;
});

connection.onInitialized(() => {
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
});
