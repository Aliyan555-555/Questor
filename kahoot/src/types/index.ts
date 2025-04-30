export interface Student {
  _id: string;
  isActive: boolean;
  nickname: string;
  score: number;
  rank: number;
  item: {
    _id: string;
    resource: string;
  };
  avatar: {
    _id: string;
    resource: string;

    colors: {
      chinColor: string;
      mouthColor: string;
      tongueColor: string;
      teethColor: string;
      eyeBorderColor: string;
      pupilColor: string;
      eyeballColor: string;
      eyebrowColor: string;
      bodyColor: string;
    };
  };
}

export interface Teacher {
  teacher: string;
  pin:number;
  quiz: {
    _id: string;
    name: string;
    questions: Question[];
    students: Student[];
    theme: {
      image: string;
    };
  };
  students: Student[];
  // currentStage:{},
  _id: string;
  status: string;
}

export interface Question {
  _id: string;
  question: string;
  options: string[];
  showQuestionDuration: number;
  duration: number;
  isMultiSelect: boolean;
  maximumMarks: number;
  answerIndex: number[];
  type: string;
  media: string;
  attemptStudents: string[];
  results: string[];
}
