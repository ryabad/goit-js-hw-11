import axios from 'axios';

export default function fetchSearchQuery(page) {
  const URL = 'https://pixabay.com/api/';
  const API_KEY = '39879115-28a2f7246b52cd09f840d063c';

  const searchField = document
    .querySelector('.search-form')
    .elements.searchQuery.value.trim();

  const params = new URLSearchParams({
    key: API_KEY,
    q: searchField,
    image_type: 'photo',
    orientation: 'horizontal',
    safeseacrch: 'true',
    per_page: 40,
    page,
  });
  return axios.get(`${URL}?${params}`);
}
