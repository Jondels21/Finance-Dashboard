import { api } from './axios';

export async function getCategories() {
  const response = await api.get('/categories');
  return response.data;
}

export async function createCategory(
  name: string,
) {
  const response = await api.post(
    '/categories',
    { name },
  );

  return response.data;
}

export async function deleteCategory(
  id: string,
) {
  await api.delete(`/categories/${id}`);
}