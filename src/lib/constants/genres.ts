export type Genre = {
  name: string;
  slug: string;
  description?: string;
  color?: string;
};

export const GENRES: Genre[] = [
  { 
    name: 'Action', 
    slug: 'action',
    description: 'Fast-paced and full of excitement with physical challenges, battles, and high-energy scenes.'
  },
  { 
    name: 'Adventure', 
    slug: 'adventure',
    description: 'Characters journey to explore new places, discover treasures, and experience the unknown.'
  },
  { 
    name: 'Comedy', 
    slug: 'comedy',
    description: 'Focuses on humor and making the audience laugh through funny situations and jokes.'
  },
  { 
    name: 'Drama', 
    slug: 'drama',
    description: 'Emotional stories that explore serious themes and character development.'
  },
  { 
    name: 'Fantasy', 
    slug: 'fantasy',
    description: 'Features magical elements, mythical creatures, and worlds beyond our reality.'
  },
  { 
    name: 'Horror', 
    slug: 'horror',
    description: 'Designed to frighten viewers with supernatural elements, gore, or psychological terror.'
  },
  { 
    name: 'Sci-Fi', 
    slug: 'sci-fi',
    description: 'Explores futuristic concepts, advanced technology, space travel, and scientific theories.'
  },
  { 
    name: 'Slice of Life', 
    slug: 'slice-of-life',
    description: 'Portrays everyday experiences and the ordinary lives of characters.'
  },
  { 
    name: 'Romance', 
    slug: 'romance',
    description: 'Focuses on romantic relationships, love stories, and emotional connections between characters.'
  },
  { 
    name: 'Mystery', 
    slug: 'mystery',
    description: 'Involves solving puzzles, crimes, or unexplained phenomena through investigation and clues.'
  },
  { 
    name: 'Supernatural', 
    slug: 'supernatural',
    description: 'Features elements beyond scientific understanding like ghosts, psychic abilities, or otherworldly phenomena.'
  },
  { 
    name: 'Sports', 
    slug: 'sports',
    description: 'Centers around athletic competitions, teamwork, and the pursuit of victory in various sports.'
  },
  { 
    name: 'Music', 
    slug: 'music',
    description: 'Focuses on musical performances, bands, idols, or the music industry.'
  },
  { 
    name: 'Mecha', 
    slug: 'mecha',
    description: 'Features large robots or machines, often piloted by humans in combat or adventure scenarios.'
  },
  { 
    name: 'Psychological', 
    slug: 'psychological',
    description: 'Explores the mental states, emotions, and inner workings of characters\' minds.'
  },
  { 
    name: 'Historical', 
    slug: 'historical',
    description: 'Set in the past, often depicting real historical events or time periods.'
  },
  { 
    name: 'Isekai', 
    slug: 'isekai',
    description: 'Characters are transported to or reborn in another world, often with fantasy elements.'
  },
  { 
    name: 'Shounen', 
    slug: 'shounen',
    description: 'Targeted at young male audiences, often featuring action, friendship, and coming-of-age themes.'
  },
  { 
    name: 'Shoujo', 
    slug: 'shoujo',
    description: 'Targeted at young female audiences, often featuring romance and emotional storylines.'
  },
  { 
    name: 'Seinen', 
    slug: 'seinen',
    description: 'Targeted at adult male audiences with more mature themes and complex storytelling.'
  },
  { 
    name: 'Josei', 
    slug: 'josei',
    description: 'Targeted at adult female audiences, featuring realistic romance and everyday life situations.'
  },
  { 
    name: 'Ecchi', 
    slug: 'ecchi',
    description: 'Contains suggestive themes and mild sexual content without being explicitly graphic.'
  },
  { 
    name: 'Harem', 
    slug: 'harem',
    description: 'Features a protagonist surrounded by multiple characters who are romantically interested in them.'
  },
  { 
    name: 'Martial Arts', 
    slug: 'martial-arts',
    description: 'Focuses on various fighting styles, combat techniques, and training.'
  }
];
