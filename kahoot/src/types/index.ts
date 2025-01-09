export interface Student {
  _id: string;
  nickname: string;
  score: number;
}

export interface Teacher {
  quizId: string;
  teacherId: string;
  kahoot: {
    _id: string;
    name: string;
    questions: Question[];
    students: Student[];
  };
  students: Student[];
}

export interface Question {
  _id: string;
  question: string;
  options: string[];
  showQuestionDuration: number;
  duration: number;
  maximumMarks: number;
  answerIndex: number[];
  type: string;
  media: string;
  attemptStudents: string[];
  results: string[];
}
