import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import {
  createCategory,
  deleteCategory,
  getCategories,
} from '../api/categories';
import { getApiError } from '../components/ApiError';
import type { Category } from '../types/category';

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Category name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await createCategory(trimmedName);
      setName('');
      await loadCategories();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm(
      'Delete this category? Existing transactions will be removed too.',
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setError('');

    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.85fr)] md:px-8">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-slate-200">
              Categories
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Keep your tracking labels tidy.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Add, review, and remove categories from a dedicated workspace.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              Back to dashboard
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Total categories</p>
            <p className="mt-2 text-4xl font-semibold">
              {categories.length}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              New categories can still be created automatically when adding a
              transaction.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Add category
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Use manual categories when you want to prepare labels in advance.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={name}
              placeholder="New category name"
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-200"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? 'Creating...' : 'Add category'}
            </button>
          </form>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Category list
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Removing a category also removes the transactions assigned to it.
            </p>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <h3 className="text-base font-semibold text-slate-900">
                  No categories yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Add one here, or type a new category while creating a
                  transaction.
                </p>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {category.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Available in transaction category suggestions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === category.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

export default CategoriesPage;
