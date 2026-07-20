import type { Genre, Movie } from "./types";

const TMDB = "https://image.tmdb.org/t/p";

export const posterUrl = (path: string, size: "w342" | "w500" | "w780" = "w500") =>
  path.startsWith("http") ? path : `${TMDB}/${size}${path}`;

export const backdropUrl = (
  path: string,
  size: "w780" | "w1280" | "w1920" | "original" = "w1280"
) => (path.startsWith("http") ? path : `${TMDB}/${size}${path}`);

export const stillUrl = (
  path: string | null | undefined,
  size: "w185" | "w300" | "w500" = "w300"
) => (path ? (path.startsWith("http") ? path : `${TMDB}/${size}${path}`) : null);

export const formatDisplayYear = (year: number) => (year > 0 ? String(year) : null);

export const movies: Movie[] = [
  {
    id: "interstellar",
    title: "Interstellar",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    overview:
      "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 8.7,
    year: 2014,
    runtime: 169,
    genres: ["Adventure", "Drama", "Sci-Fi"],
    director: "Christopher Nolan",
    cast: [
      { name: "Matthew McConaughey", role: "Cooper" },
      { name: "Anne Hathaway", role: "Brand" },
      { name: "Jessica Chastain", role: "Murph" },
      { name: "Michael Caine", role: "Professor Brand" },
    ],
    featured: true,
    trending: true,
  },
  {
    id: "inception",
    title: "Inception",
    tagline: "Your mind is the scene of the crime.",
    overview:
      "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: inception.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 8.8,
    year: 2010,
    runtime: 148,
    genres: ["Action", "Sci-Fi", "Thriller"],
    director: "Christopher Nolan",
    cast: [
      { name: "Leonardo DiCaprio", role: "Cobb" },
      { name: "Joseph Gordon-Levitt", role: "Arthur" },
      { name: "Ellen Page", role: "Ariadne" },
      { name: "Tom Hardy", role: "Eames" },
    ],
    trending: true,
  },
  {
    id: "the-dark-knight",
    title: "The Dark Knight",
    tagline: "Why so serious?",
    overview:
      "Batman raises the stakes in his war on crime. With the help of Lt. Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 9.0,
    year: 2008,
    runtime: 152,
    genres: ["Action", "Crime", "Drama"],
    director: "Christopher Nolan",
    cast: [
      { name: "Christian Bale", role: "Bruce Wayne" },
      { name: "Heath Ledger", role: "Joker" },
      { name: "Aaron Eckhart", role: "Harvey Dent" },
      { name: "Michael Caine", role: "Alfred" },
    ],
    trending: true,
  },
  {
    id: "dune-part-two",
    title: "Dune: Part Two",
    tagline: "Long live the fighters.",
    overview:
      "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 8.5,
    year: 2024,
    runtime: 166,
    genres: ["Adventure", "Sci-Fi", "Drama"],
    director: "Denis Villeneuve",
    cast: [
      { name: "Timothée Chalamet", role: "Paul Atreides" },
      { name: "Zendaya", role: "Chani" },
      { name: "Rebecca Ferguson", role: "Lady Jessica" },
      { name: "Austin Butler", role: "Feyd-Rautha" },
    ],
    newRelease: true,
    trending: true,
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    tagline: "The world forever changes.",
    overview:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 8.3,
    year: 2023,
    runtime: 180,
    genres: ["Drama", "Thriller"],
    director: "Christopher Nolan",
    cast: [
      { name: "Cillian Murphy", role: "J. Robert Oppenheimer" },
      { name: "Emily Blunt", role: "Kitty Oppenheimer" },
      { name: "Matt Damon", role: "Leslie Groves" },
      { name: "Robert Downey Jr.", role: "Lewis Strauss" },
    ],
    newRelease: true,
  },
  {
    id: "parasite",
    title: "Parasite",
    tagline: "Act like you own the place.",
    overview:
      "All unemployed, the Kim family takes peculiar interest in the wealthy Park family, embarking on a scheme that gets dangerously intertwined with unexpected consequences.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_SX300.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_SX300.jpg",
    rating: 8.5,
    year: 2019,
    runtime: 132,
    genres: ["Comedy", "Drama", "Thriller"],
    director: "Bong Joon-ho",
    cast: [
      { name: "Song Kang-ho", role: "Ki-taek" },
      { name: "Lee Sun-kyun", role: "Dong-ik" },
      { name: "Cho Yeo-jeong", role: "Yeong-gyo" },
      { name: "Choi Woo-shik", role: "Ki-woo" },
    ],
  },
  {
    id: "spider-man-across",
    title: "Spider-Man: Across the Spider-Verse",
    tagline: "It's how you wear the mask that matters.",
    overview:
      "After reuniting with Gwen Stacy, Brooklyn's full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BNThiZjA3MjItZGY5Ni00ZmJhLWEwN2EtOTBlYTA4Y2E0M2ZmXkEyXkFqcGc@._V1_SX300.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BNThiZjA3MjItZGY5Ni00ZmJhLWEwN2EtOTBlYTA4Y2E0M2ZmXkEyXkFqcGc@._V1_SX300.jpg",
    rating: 8.6,
    year: 2023,
    runtime: 140,
    genres: ["Animation", "Action", "Adventure"],
    director: "Joaquim Dos Santos",
    cast: [
      { name: "Shameik Moore", role: "Miles Morales" },
      { name: "Hailee Steinfeld", role: "Gwen Stacy" },
      { name: "Oscar Isaac", role: "Miguel O'Hara" },
      { name: "Jake Johnson", role: "Peter B. Parker" },
    ],
    newRelease: true,
    trending: true,
  },
  {
    id: "the-matrix",
    title: "The Matrix",
    tagline: "Welcome to the Real World.",
    overview:
      "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    rating: 8.7,
    year: 1999,
    runtime: 136,
    genres: ["Action", "Sci-Fi"],
    director: "Lana Wachowski",
    cast: [
      { name: "Keanu Reeves", role: "Neo" },
      { name: "Laurence Fishburne", role: "Morpheus" },
      { name: "Carrie-Anne Moss", role: "Trinity" },
      { name: "Hugo Weaving", role: "Agent Smith" },
    ],
  },
  {
    id: "la-la-land",
    title: "La La Land",
    tagline: "Here's to the fools who dream.",
    overview:
      "Mia, an aspiring actress, serves lattes to movie stars in between auditions and Sebastian, a jazz musician, scrapes by playing cocktail party gigs in dingy bars.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 8.0,
    year: 2016,
    runtime: 128,
    genres: ["Comedy", "Drama", "Romance"],
    director: "Damien Chazelle",
    cast: [
      { name: "Ryan Gosling", role: "Sebastian" },
      { name: "Emma Stone", role: "Mia" },
      { name: "John Legend", role: "Keith" },
      { name: "Rosemarie DeWitt", role: "Laura" },
    ],
  },
  {
    id: "get-out",
    title: "Get Out",
    tagline: "Just because you're invited, doesn't mean you're welcome.",
    overview:
      "Chris and his girlfriend Rose go to visit her parents for the weekend. At first, Chris reads the family's overly accommodating behavior as nervous attempts to deal with their daughter's interracial relationship.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyNl5BMl5BanBnXkFtZTgwNzcwMzc0MTI@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyNl5BMl5BanBnXkFtZTgwNzcwMzc0MTI@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 7.8,
    year: 2017,
    runtime: 104,
    genres: ["Horror", "Mystery", "Thriller"],
    director: "Jordan Peele",
    cast: [
      { name: "Daniel Kaluuya", role: "Chris Washington" },
      { name: "Allison Williams", role: "Rose Armitage" },
      { name: "Catherine Keener", role: "Missy Armitage" },
      { name: "Bradley Whitford", role: "Dean Armitage" },
    ],
  },
  {
    id: "mad-max-fury-road",
    title: "Mad Max: Fury Road",
    tagline: "What a lovely day.",
    overview:
      "An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and almost everyone is crazed fighting for the necessities of life.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BZDRkODJhOTgtOTc1OC00NTgzLTk4NjItNDgxZDY4YjlmNDY2XkEyXkFqcGc@._V1_SX300.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BZDRkODJhOTgtOTc1OC00NTgzLTk4NjItNDgxZDY4YjlmNDY2XkEyXkFqcGc@._V1_SX300.jpg",
    rating: 8.1,
    year: 2015,
    runtime: 120,
    genres: ["Action", "Adventure", "Sci-Fi"],
    director: "George Miller",
    cast: [
      { name: "Tom Hardy", role: "Max Rockatansky" },
      { name: "Charlize Theron", role: "Imperator Furiosa" },
      { name: "Nicholas Hoult", role: "Nux" },
      { name: "Hugh Keays-Byrne", role: "Immortan Joe" },
    ],
    trending: true,
  },
  {
    id: "everything-everywhere",
    title: "Everything Everywhere All at Once",
    tagline: "The universe is so much bigger than you think.",
    overview:
      "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BOWNmMzAzZmQtNDQ1NC00Nzk5LTkyMmUtNGI2N2NkOWM4MzEyXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BOWNmMzAzZmQtNDQ1NC00Nzk5LTkyMmUtNGI2N2NkOWM4MzEyXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg",
    rating: 8.0,
    year: 2022,
    runtime: 139,
    genres: ["Action", "Adventure", "Comedy"],
    director: "Daniel Kwan",
    cast: [
      { name: "Michelle Yeoh", role: "Evelyn Wang" },
      { name: "Stephanie Hsu", role: "Joy Wang" },
      { name: "Ke Huy Quan", role: "Waymond Wang" },
      { name: "Jamie Lee Curtis", role: "Deirdre Beaubeirdre" },
    ],
    newRelease: true,
  },
  {
    id: "the-shawshank-redemption",
    title: "The Shawshank Redemption",
    tagline: "Fear can hold you prisoner. Hope can set you free.",
    overview:
      "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    rating: 9.3,
    year: 1994,
    runtime: 142,
    genres: ["Drama", "Crime"],
    director: "Frank Darabont",
    cast: [
      { name: "Tim Robbins", role: "Andy Dufresne" },
      { name: "Morgan Freeman", role: "Ellis Boyd Redding" },
      { name: "Bob Gunton", role: "Warden Norton" },
      { name: "William Sadler", role: "Heywood" },
    ],
  },
  {
    id: "blade-runner-2049",
    title: "Blade Runner 2049",
    tagline: "The key to the future is finally unearthed.",
    overview:
      "Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 8.0,
    year: 2017,
    runtime: 164,
    genres: ["Sci-Fi", "Drama", "Mystery"],
    director: "Denis Villeneuve",
    cast: [
      { name: "Ryan Gosling", role: "K" },
      { name: "Harrison Ford", role: "Rick Deckard" },
      { name: "Ana de Armas", role: "Joi" },
      { name: "Jared Leto", role: "Niander Wallace" },
    ],
  },
  {
    id: "whiplash",
    title: "Whiplash",
    tagline: "The road to greatness can take you to the edge.",
    overview:
      "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMDFjOWFkYzktYzhhMC00NmYyLTkwY2EtYjViMDhmNzg0OGFkXkEyXkFqcGc@._V1_SX300.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BMDFjOWFkYzktYzhhMC00NmYyLTkwY2EtYjViMDhmNzg0OGFkXkEyXkFqcGc@._V1_SX300.jpg",
    rating: 8.5,
    year: 2014,
    runtime: 106,
    genres: ["Drama", "Thriller"],
    director: "Damien Chazelle",
    cast: [
      { name: "Miles Teller", role: "Andrew Neiman" },
      { name: "J.K. Simmons", role: "Terence Fletcher" },
      { name: "Paul Reiser", role: "Jim Neiman" },
      { name: "Melissa Benoist", role: "Nicole" },
    ],
  },
  {
    id: "the-grand-budapest",
    title: "The Grand Budapest Hotel",
    tagline: "A murder. A mystery. A hotel.",
    overview:
      "The Grand Budapest Hotel tells of a legendary concierge at a famous European hotel between the wars and his friendship with a young employee who becomes his trusted protégé.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BMzM5NjUxOTEyMl5BMl5BanBnXkFtZTgwNjEyMDM0MDE@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 8.1,
    year: 2014,
    runtime: 100,
    genres: ["Comedy", "Drama", "Adventure"],
    director: "Wes Anderson",
    cast: [
      { name: "Ralph Fiennes", role: "M. Gustave" },
      { name: "Tony Revolori", role: "Zero Moustafa" },
      { name: "Saoirse Ronan", role: "Agatha" },
      { name: "Adrien Brody", role: "Dmitri" },
    ],
  },
  {
    id: "hereditary",
    title: "Hereditary",
    tagline: "Every family tree hides a secret.",
    overview:
      "When the matriarch of the Graham family passes away, her daughter and grandchildren begin to unravel cryptic and increasingly terrifying secrets about their ancestry.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BNTEyZGQwODctYWJjZi00NjFmLTg3YmEtMzlhNjljOGZhMWMyXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BNTEyZGQwODctYWJjZi00NjFmLTg3YmEtMzlhNjljOGZhMWMyXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 7.3,
    year: 2018,
    runtime: 127,
    genres: ["Horror", "Mystery", "Drama"],
    director: "Ari Aster",
    cast: [
      { name: "Toni Collette", role: "Annie Graham" },
      { name: "Alex Wolff", role: "Peter Graham" },
      { name: "Milly Shapiro", role: "Charlie Graham" },
      { name: "Gabriel Byrne", role: "Steve Graham" },
    ],
  },
  {
    id: "arrival",
    title: "Arrival",
    tagline: "Why are they here?",
    overview:
      "Taking place after alien crafts land around the world, an expert linguist is recruited by the military to determine whether they come in peace or are a threat.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BMTExMzU0ODcxNDheQTJeQWpwZ15BbWU4MDE1OTI4MzAy._V1_SX300.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BMTExMzU0ODcxNDheQTJeQWpwZ15BbWU4MDE1OTI4MzAy._V1_SX300.jpg",
    rating: 7.9,
    year: 2016,
    runtime: 116,
    genres: ["Drama", "Sci-Fi", "Mystery"],
    director: "Denis Villeneuve",
    cast: [
      { name: "Amy Adams", role: "Louise Banks" },
      { name: "Jeremy Renner", role: "Ian Donnelly" },
      { name: "Forest Whitaker", role: "Colonel Weber" },
      { name: "Michael Stuhlbarg", role: "Agent Halpern" },
    ],
  },
  {
    id: "joker",
    title: "Joker",
    tagline: "Put on a happy face.",
    overview:
      "During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic crime figure.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BNzY3OWQ5NDktNWQ2OC00ZjdlLThkMmItMDhhNDk3NTFiZGU4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BNzY3OWQ5NDktNWQ2OC00ZjdlLThkMmItMDhhNDk3NTFiZGU4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    rating: 8.4,
    year: 2019,
    runtime: 122,
    genres: ["Crime", "Drama", "Thriller"],
    director: "Todd Phillips",
    cast: [
      { name: "Joaquin Phoenix", role: "Arthur Fleck" },
      { name: "Robert De Niro", role: "Murray Franklin" },
      { name: "Zazie Beetz", role: "Sophie Dumond" },
      { name: "Frances Conroy", role: "Penny Fleck" },
    ],
  },
  {
    id: "avatar-way-of-water",
    title: "Avatar: The Way of Water",
    tagline: "Return to Pandora.",
    overview:
      "Set more than a decade after the events of the first film, Avatar: The Way of Water begins to tell the story of the Sully family, the trouble that follows them, and the lengths they go to keep each other safe.",
    posterPath: "https://m.media-amazon.com/images/M/MV5BNWI0Y2NkOWEtMmM2OC00MjQ3LWI1YzItZGQxYzQ3NzI4NWZmXkEyXkFqcGc@._V1_SX300.jpg",
    backdropPath: "https://m.media-amazon.com/images/M/MV5BNWI0Y2NkOWEtMmM2OC00MjQ3LWI1YzItZGQxYzQ3NzI4NWZmXkEyXkFqcGc@._V1_SX300.jpg",
    rating: 7.6,
    year: 2022,
    runtime: 192,
    genres: ["Action", "Adventure", "Fantasy"],
    director: "James Cameron",
    cast: [
      { name: "Sam Worthington", role: "Jake Sully" },
      { name: "Zoe Saldaña", role: "Neytiri" },
      { name: "Sigourney Weaver", role: "Kiri" },
      { name: "Kate Winslet", role: "Ronal" },
    ],
    newRelease: true,
  },
];

export const allGenres: Genre[] = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

export function getMovieById(id: string): Movie | undefined {
  return movies.find((m) => m.id === id);
}

export function getFeaturedMovie(): Movie {
  return movies.find((m) => m.featured) ?? movies[0];
}

export function getTrendingMovies(): Movie[] {
  return movies.filter((m) => m.trending);
}

export function getNewReleases(): Movie[] {
  return movies.filter((m) => m.newRelease);
}

export function getMoviesByGenre(genre: Genre): Movie[] {
  return movies.filter((m) => m.genres.includes(genre));
}

export function searchMovies(query: string): Movie[] {
  const q = query.trim().toLowerCase();
  if (!q) return movies;
  return movies.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      m.director.toLowerCase().includes(q) ||
      m.cast.some((c) => c.name.toLowerCase().includes(q))
  );
}

export function getSimilarMovies(movie: Movie, limit = 6): Movie[] {
  return movies
    .filter((m) => m.id !== movie.id && m.genres.some((g) => movie.genres.includes(g)))
    .slice(0, limit);
}

export function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
