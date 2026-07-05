import { useEffect, useState } from 'react';

import {
  getCategories,
  createCategory,
  deleteCategory,
} from '../api/categories';

import type { Category } from '../types/category';

function CategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [name, setName] = useState('');

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!name.trim()) return;

    await createCategory(name);

    setName('');

    await loadCategories();
  };

  const handleDelete = async (
    id: string,
  ) => {
    await deleteCategory(id);

    await loadCategories();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Categories
        </h1>
      </ div>

      <div className="mb-6 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">
          Create Category
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex gap-3"
        >
          <input
            value={name}
            placeholder="Category name"
            onChange={(e) =>
              setName(e.target.value)
            }
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            Add Category
          </button>
        </form>
      </div>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="bg-white shadow rounded p-3 flex justify-between"
          >
            <span>{category.name}</span>

            <button
              onClick={() =>
                handleDelete(category.id)
              }
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoriesPage;