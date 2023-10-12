import Notiflix from 'notiflix';
import fetchSearchQuery from './pixabay';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  target: document.querySelector('.scroll-point'),
};

let currentPage = 1;
let totalCurrentCard = 0;
let searchField;
// let idCard = 0;

const simpleLB = new SimpleLightbox('.gallery a', {
  showCounter: false,
  captionsData: 'Alt',
});

Notiflix.Notify.init({
  position: 'left-top',
});

const optionsObserver = {
  root: null,
  rootMargin: '50px',
  threshold: 1.0,
};

refs.form.addEventListener('submit', handleSubmit);

let observer = new IntersectionObserver(scrollHandle, optionsObserver);

function scrollHandle(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;

      fetchSearchQuery(currentPage)
        .then(response => {
          totalCurrentCard += response.data.hits.length;
          // Notiflix.Notify.success(
          //   `Loading next ${response.data.hits.length} images are success!`
          // );

          refs.gallery.insertAdjacentHTML(
            'beforeend',
            markup(response.data.hits)
          );
          // console.log(
          //   `${totalCurrentCard} - counter, total - ${response.data.totalHits}`
          // );
          simpleLB.refresh();

          const { height: cardHeight } =
            refs.gallery.firstElementChild.getBoundingClientRect();

          window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth',
          });

          if (totalCurrentCard >= response.data.totalHits) {
            observer.unobserve(refs.target);
            Notiflix.Notify.info(`You've reached the end of search results!`);
          }
        })
        .catch(error => console.log(`Error: ${error}`));
    }
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  searchField = refs.form.elements.searchQuery.value.trim();

  if (searchField === '') {
    return Notiflix.Notify.failure('This field must not be empty!');
  }
  try {
    const response = await fetchSearchQuery(currentPage);
    const data = response.data.hits;
    const totalImages = response.data.totalHits;
    totalCurrentCard = data.length;

    if (data.length === 0) {
      refs.gallery.textContent = '';
      return Notiflix.Notify.failure(
        `Sorry, there are no images with your search query. Please, try again!`
      );
    }

    refs.gallery.innerHTML = markup(data);

    simpleLB.refresh();
    observer.observe(refs.target);
    Notiflix.Notify.success(
      `We have found ${totalImages} images matching your request!`
    );
  } catch (error) {
    Notiflix.Notify.failure(`Error: ${error}`);
  }
}

function markup(data) {
  return data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        // idCard += 1;
        return `<div class="card">
                  <a href="${largeImageURL}">
                    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                  </a>
                  <div class="about-cat">
                    <h2>Statistics:</h2>
                      <ul>
                        <li>${likes} likes!</li>
                        <li>${views} views!</li>
                        <li>${comments} comments!</li>
                        <li>${downloads} downloads!</li>
                      </ul>
                  </div>
                </div>`;
      }
    )
    .join('');
}
