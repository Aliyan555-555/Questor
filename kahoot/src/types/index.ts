export interface Student {
  _id: string;
  nickname: string;
  score: number;
  item:{
    id:string;
    resource:string
  },
  avatar: {
    id: string;
  resource: string;
  colors: {
    chinColor: string;
    mouthColor: string;
    tongueColor: string;
    teethColor: string;
    eyeBorderColor:string;
    pupilColor:string;
    eyeballColor:string;
    eyebrowColor:string;
    bodyColor:string;
  };
  };
}

export interface Teacher {
  quizId: string;
  teacherId: string;
  kahoot: {
    _id: string;
    name: string;
    questions: Question[];
    students: Student[];
    theme:{
      image:string
    }
  };
  students: Student[];
}

export interface Question {
  _id: string;
  question: string;
  options: string[];
  showQuestionDuration: number;
  duration: number;
  isMultiSelect:boolean;
  maximumMarks: number;
  answerIndex: number[];
  type: string;
  media: string;
  attemptStudents: string[];
  results: string[];
}
