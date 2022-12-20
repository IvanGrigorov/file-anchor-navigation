// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let dataProvider =  new TreeDataProvider(context);
	vscode.window.registerTreeDataProvider('package-bookmarks',dataProvider);


	vscode.window.onDidChangeActiveTextEditor((editor) => {
		dataProvider =  new TreeDataProvider(context);
		vscode.window.registerTreeDataProvider('package-bookmarks',dataProvider);
	});

	let goToLine = vscode.commands.registerCommand('file-navigation.goToLine', (line: number) => {
		let pos1 = new vscode.Position(line, 0);
		let pos2 = new vscode.Position(line, 0);
		let sel = new vscode.Selection(pos1, pos2);
		vscode.window.activeTextEditor!.selection = sel;
		var range = new vscode.Range(pos1, pos2);
		vscode.window.activeTextEditor!.revealRange(range);
	});

	vscode.commands.registerCommand('file-navigation.deleteEntry', (node: TreeItem) => {
		let file = vscode.window.activeTextEditor?.document.fileName;
		if (file) {
			let newData = context.globalState.get(file) as Array<TreeItem> || [];
			newData = newData.filter(treeNode => treeNode.label != node.label)
			context.globalState.update(vscode.window.activeTextEditor!.document.fileName, newData).then(() => {
				dataProvider.refresh();
			});
		}
	});

	let selectLine = vscode.commands.registerCommand('file-navigation.selectLine', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInputBox({
			placeHolder: "Line anchor identifier"
		}).then((input) => {
			let line = vscode.window.activeTextEditor?.selection.anchor.line || -1;
			let file = vscode.window.activeTextEditor?.document.fileName;
			if (line > -1 && file) {
				let title = input || vscode.window.activeTextEditor?.document.lineAt(line).text || '';
				let newData = context.globalState.get(file) as Array<TreeItem> || [];
				newData = [...newData, new TreeItem(title, line)]
				context.globalState.update(vscode.window.activeTextEditor!.document.fileName, newData).then(() => {
					dataProvider.refresh();
				});
			}
		});
	});

	context.subscriptions.push(selectLine);
	context.subscriptions.push(goToLine);

}

function loadTreeView() {

}

// class LineDetails {

// 	line: number;
// 	title: string;

// 	constructor(line: number, title: string) {
// 		this.line = line;
// 		this.title = title;
// 	}
// }

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();

   readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	} 

	data: TreeItem[] | undefined;
	context: vscode.ExtensionContext;

	private loadData() {
		let file = vscode.window.activeTextEditor?.document.fileName;
		if (file && this.context.globalState.get(file)) {
  
			this.data = this.context.globalState.get(file);
		}
		else {
		  this.data = [];
		}
	}

	
  
	constructor(context: vscode.ExtensionContext) {
	  this.context = context;
	  this.loadData();
	}
  
	getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
	  return element;
	}
  
	getChildren(): vscode.ProviderResult<TreeItem[]> {
		this.loadData();
		return this.data;

	}
  }
  
  class TreeItem extends vscode.TreeItem {
	children:  undefined;
	line: number;
	constructor(label: string, line: number) {
	  super(
		  label,
		  vscode.TreeItemCollapsibleState.None)
	  this.line = line;
	  this.command = {
			title: 'Go To Line',
			command: 'file-navigation.goToLine',
			arguments: [line]
		}
	}
  }

// This method is called when your extension is deactivated
export function deactivate() {}
