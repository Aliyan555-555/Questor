import { KahootIcon, PuzzleIcon, SliderIcon, TrueFalseIcon, TypeAnswerIcon } from '@/src/lib/svg';

export const QuestionsTypes = [
  {
    id: 1,
    title: "quiz",
    icon: (<KahootIcon w={30} h={30} />),
    type: 'quiz'
  },
  {
    id: 2,
    title: "True or False",
    icon: (<TrueFalseIcon w={30} h={30} />),
    type: 'true/false'
  },
  {
    id: 3,
    title: "Type Answer",
    icon: (<TypeAnswerIcon w={30} h={30} />),
    type: 'typeanswer'
  },
  {
    id: 4,
    title: "Slider",
    icon: (<SliderIcon w={30} h={30} />),
    type: 'slider'
  },
  // {
  //   id: 5,
  //   title: "Puzzle",
  //   icon: (<PuzzleIcon w={30} h={30} />)
  // },
];


export const TimeLimit = [
  {
    id: 1,
    title: "5 second",
    value: 5
  },
  {
    id: 2,
    title: "10 second",
    value: 10
  },
  {
    id: 3,
    title: "15 second",
    value: 15
  },
  {
    id: 4,
    title: "20 second",
    value: 20
  },
  {
    id: 5,
    title: "25 second",
    value: 25
  },
  {
    id: 6,
    title: "30 second",
    value: 30
  },
  {
    id: 7,
    title: "35 second",
    value: 35
  },
  {
    id: 8,
    title: "40 second",
    value: 40
  },
  {
    id: 9,
    title: "45 second",
    value: 45
  },
  {
    id: 10,
    title: "50 second",
    value: 50
  },
  {
    id: 11,
    title: "55 second",
    value: 55
  },
  {
    id: 12,
    title: "60 second",
    value: 60
  },
]