import * as vscode from 'vscode';
import axios from 'axios'; 

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('stackoverflow-search.search', async () => {
    const query = await vscode.window.showInputBox({ prompt: 'Search StackOverflow' });
    if (query) {
      const panel = vscode.window.createWebviewPanel(
        'stackoverflowSearch',
        'StackOverflow Search',
        vscode.ViewColumn.One,
        {}
      );
      panel.webview.html = await getSearchResults(query);
    }
  });

  context.subscriptions.push(disposable);
}

async function getSearchResults(query: string): Promise<string> {
  try {
    const response = await axios.get<{ items: { link: string; title: string }[] }>(`https://api.stackexchange.com/2.3/search/advanced`, {
      params: {
        order: 'desc',
        sort: 'relevance',
        q: query,
        site: 'stackoverflow'
      }
    });

    const items = response.data.items;
    if (items.length === 0) {
      return `<h2>No results found for "${query}".</h2>`;
    }

    const results = items
      .map((item: any) => `<h3><a href="${item.link}" target="_blank">${item.title}</a></h3>`)
      .join('');
    return `<html><body>${results}</body></html>`;
  } catch (error) {
    console.error(error);
    return `<h2>Failed to fetch search results.</h2>`;
  }
}

export function deactivate() {}
