import { toast } from "sonner";

export const generateTranscription = async (file) => {
  console.log('Generating transcription for file:', file.name);
  try {
    // Simulating a fast transcription process
    await new Promise(resolve => setTimeout(resolve, 200));
    if (Math.random() < 0.1) { // 10% chance of error for demonstration
      throw new Error("Transcription service unavailable");
    }
    const result = {
      transcription: 'This is a sample transcription.',
      summary: 'This is a sample summary.',
      speakers: [{ id: 1, name: 'Speaker 1' }]
    };
    console.log('Transcription generated:', result);
    return result;
  } catch (error) {
    console.error('Transcription generation failed:', error);
    toast.error(`Transcription failed: ${error.message}`);
    throw error;
  }
};

export const generateThumbnail = async (file) => {
  console.log('Generating thumbnail for file:', file.name);
  try {
    // Simulating thumbnail generation
    await new Promise(resolve => setTimeout(resolve, 500));
    return "/placeholder.svg";
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    toast.error(`Thumbnail generation failed: ${error.message}`);
    throw error;
  }
};

export const detectPlaylist = async (transcription) => {
  console.log('Detecting playlist based on transcription');
  try {
    // This is a simplified playlist detection. In a real scenario, you'd use more advanced NLP techniques.
    const keywords = {
      'tutorial': 'Tutorials',
      'review': 'Product Reviews',
      'unboxing': 'Unboxing Videos',
      'vlog': 'Vlogs',
      'gaming': 'Gaming Content',
      'music': 'Music Videos',
      'news': 'News Updates',
      'cooking': 'Cooking Tutorials',
      'travel': 'Travel Vlogs',
      'tech': 'Tech Reviews'
    };

    const words = transcription.toLowerCase().split(/\s+/);
    for (const [keyword, playlist] of Object.entries(keywords)) {
      if (words.includes(keyword)) {
        return playlist;
      }
    }

    return 'Miscellaneous'; // Default playlist if no match is found
  } catch (error) {
    console.error('Error detecting playlist:', error);
    return 'Miscellaneous'; // Default to a general playlist in case of error
  }
};

export const generateAIMetadata = async (transcription) => {
  console.log('Generating AI metadata for transcription:', transcription);
  try {
    // Simulating AI processing of the transcription
    await new Promise(resolve => setTimeout(resolve, 500));

    // Extract key topics from the transcription
    const topics = extractTopics(transcription);
    console.log('Extracted topics:', topics);

    // Generate a title prefix based on the main topic
    const titlePrefix = generateTitlePrefix(topics[0]);
    console.log('Generated title prefix:', titlePrefix);

    // Generate a more relevant title
    const title = `${titlePrefix}: ${generateRelevantTitle(topics)}`;
    console.log('Generated title:', title);

    // Generate a description based on the transcription and topics
    const description = generateDescription(transcription, topics);
    console.log('Generated description:', description);

    // Generate tags based on the topics and title
    const tags = generateTags(topics, title);
    console.log('Generated tags:', tags);

    const result = { title, description, tags: tags.join(',') };
    console.log('AI metadata generation result:', result);
    return result;
  } catch (error) {
    console.error('AI metadata generation failed:', error);
    toast.error(`AI metadata generation failed: ${error.message}`);
    throw error;
  }
};

const extractTopics = (transcription) => {
  // This is a simplified topic extraction. In a real scenario, you'd use NLP techniques.
  const words = transcription.toLowerCase().split(/\s+/);
  const wordFrequency = words.reduce((acc, word) => {
    if (word.length > 3) { // Ignore short words
      acc[word] = (acc[word] || 0) + 1;
    }
    return acc;
  }, {});
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
};

const generateTitlePrefix = (mainTopic) => {
  const prefixes = [
    "The Ultimate Guide to",
    "Mastering",
    "Exploring",
    "Understanding",
    "Demystifying",
    "The Secrets of",
    "Unlocking the Power of",
    "A Deep Dive into",
    "The Future of",
    "Revolutionizing"
  ];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`;
};

const generateRelevantTitle = (topics) => {
  return `How ${topics[1]} and ${topics[2]} Impact ${topics[0]}`;
};

const generateDescription = (transcription, topics) => {
  const summary = transcription.split('.').slice(0, 3).join('.') + '.';
  return `Discover the intricate relationship between ${topics.join(', ')} in this insightful video. ${summary} Learn how these concepts interplay and affect your understanding of ${topics[0]}.`;
};

const generateTags = (topics, title) => {
  const titleWords = title.toLowerCase().split(/\s+/);
  return [...new Set([...topics, ...titleWords])].filter(tag => tag.length > 3).slice(0, 15);
};

export const generateKeywordSuggestions = async (title, description, playlistName, existingTags) => {
  console.log('Generating keyword suggestions');
  try {
    const currentYear = new Date().getFullYear();
    const keywordSources = [title, description, playlistName, 'youtube', 'video', currentYear.toString()];
    const generatedTags = [];
    const recycledTags = recycleRelevantTags(existingTags, currentYear);

    // Add recycled tags first
    generatedTags.push(...recycledTags);

    while (generatedTags.length < 25) {
      const randomSource = keywordSources[Math.floor(Math.random() * keywordSources.length)];
      const words = randomSource.split(' ');
      const tag = words[Math.floor(Math.random() * words.length)].toLowerCase();

      if (!existingTags.includes(tag) && !generatedTags.includes(tag) && tag.length > 2) {
        generatedTags.push(tag);
      }
    }

    if (generatedTags.length === 0) {
      throw new Error("Failed to generate any valid tags");
    }

    return generatedTags;
  } catch (error) {
    toast.error(`Keyword suggestion generation failed: ${error.message}`);
    throw error;
  }
};

const recycleRelevantTags = (existingTags, currentYear) => {
  const recycledTags = [];
  const nextYear = currentYear + 1;

  existingTags.forEach(tag => {
    // Update year-specific tags
    if (tag.match(/^\d{4}$/)) {
      const tagYear = parseInt(tag);
      if (tagYear === currentYear || tagYear === currentYear - 1) {
        recycledTags.push(nextYear.toString());
      }
    } 
    // Recycle other relevant tags (you can add more conditions here)
    else if (tag.includes('tutorial') || tag.includes('guide') || tag.includes('how-to')) {
      recycledTags.push(tag);
    }
  });

  return recycledTags;
};
