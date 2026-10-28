import { KanbanBoard } from './components/kaban/KanbanBoard';

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Ecoa CRM</h1>

        <p className="mt-1 text-sm text-slate-500">Gerenciamento do funil de vendas</p>
      </header>

      <KanbanBoard />
    </main>
  );
}
