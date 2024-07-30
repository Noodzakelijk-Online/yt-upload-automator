export const initialState = {
  videoFile: null,
  thumbnailUrl: null,
  title: '',
  description: '',
  tags: [],
  transcription: '',
  summary: '',
  speakers: [],
  scheduledTime: null,
  isProcessing: false,
  progress: 0,
};

export const useVideoUploadReducer = (state, action) => {
  switch (action.type) {
    case 'SET_VIDEO_FILE':
      return { ...state, videoFile: action.payload };
    case 'SET_THUMBNAIL':
      return { ...state, thumbnailUrl: action.payload };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'SET_TRANSCRIPTION':
      return { ...state, transcription: action.payload };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };
    case 'SET_SPEAKERS':
      return { ...state, speakers: action.payload };
    case 'SET_SCHEDULED_TIME':
      return { ...state, scheduledTime: action.payload };
    case 'START_PROCESSING':
      return { ...state, isProcessing: true, progress: 0 };
    case 'UPDATE_PROGRESS':
      return { ...state, progress: action.payload };
    case 'END_PROCESSING':
      return { ...state, isProcessing: false, progress: 100 };
    default:
      return state;
  }
};
