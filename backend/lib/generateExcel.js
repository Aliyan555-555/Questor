import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import ExcelJS from 'exceljs';
import dotenv from 'dotenv'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
dotenv.config();
const generateStyledExcel = async (quizData) => {
  const fileName = `${Date.now()}-${randomUUID()}.xlsx`
  const filePath = path.join(uploadsDir,fileName);
  const workbook = new ExcelJS.Workbook();
  
  // Styles
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E86C1' } },
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
  };

  const questionHeaderStyle = {
    font: { bold: true, color: { argb: 'FF000000' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFAED6F1' } }
  };

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Quiz Name', key: 'name', width: 30 },
    { header: 'Host', key: 'host', width: 25 },
    { header: 'End Time', key: 'endTime', width: 25 },
    { header: 'Participants', key: 'participants', width: 15 },
    { header: 'Average Score', key: 'avgScore', width: 15 }
  ];

  const totalScore = quizData.students.reduce((sum, student) => sum + student.score, 0);
  const avgScore = totalScore / quizData.students.length;

  summarySheet.addRow({
    name: quizData.name,
    host: quizData.hostName,
    endTime: quizData.endTime,
    participants: quizData.numberOfParticipants,
    avgScore: avgScore.toFixed(2)
  });

  // Student Performance Sheet
  const studentSheet = workbook.addWorksheet('Student Performance');
  studentSheet.columns = [
    { header: 'Rank', key: 'rank', width: 8 },
    { header: 'Nickname', key: 'nickname', width: 25 },
    { header: 'Score', key: 'score', width: 15 },
    { header: 'Correct Answers', key: 'correct', width: 18 },
    { header: 'Unanswered', key: 'unanswered', width: 15 },
    ...quizData.questions.map((q, i) => ({
      header: `Q${i+1} Score`,
      key: `q${i+1}`,
      width: 15
    }))
  ];

  quizData.students.forEach(student => {
    const rowData = {
      rank: student.rank,
      nickname: student.nickname,
      score: student.score,
      correct: student.correctAnswers,
      unanswered: student.unansweredQuestions
    };
    
    student.questions.forEach((q, i) => {
      rowData[`q${i+1}`] = q.result.score.toFixed(2);
    });
    
    studentSheet.addRow(rowData);
  });

  // Question Analysis Sheet
  const questionSheet = workbook.addWorksheet('Question Analysis');
  questionSheet.columns = [
    { header: 'Question', key: 'text', width: 40 },
    { header: 'Correct Answer', key: 'correct', width: 25 },
    { header: 'Avg Time (sec)', key: 'time', width: 18 },
    { header: '% Correct', key: 'correctPct', width: 15 },
    { header: 'Top Wrong Answer', key: 'wrong', width: 25 },
    { header: 'Max Score', key: 'max', width: 15 }
  ];

  quizData.questions.forEach(q => {
    const times = q.students.map(s => s.timeSpend);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    // const wrongAnswers = q.studentAnswers.filter(a => 
    //   !q.options[q.answerIndex[0]].includes(a)
    // );
    // const wrongCounts = wrongAnswers.reduce((acc, val) => {
    //   acc[val] = (acc[val] || 0) + 1;
    //   return acc;
    // }, {});
    // const topWrong = Object.entries(wrongCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    questionSheet.addRow({
      text: q.question,
      correct: q.options[q.answerIndex[0]],
      time: avgTime.toFixed(2),
      correctPct: `${q.correctAnswersPercentage}%`,
      wrong: topWrong,
      max: q.maximumMarks
    });
  });

  // Apply Styles
  [summarySheet, studentSheet, questionSheet].forEach(sheet => {
    sheet.getRow(1).eachCell(cell => {
      Object.assign(cell, headerStyle);
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell(cell => {
          cell.border = headerStyle.border;
          if (rowNumber % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F4F4' } };
          }
        });
      }
    });
  });

  // Question headers special style
  questionSheet.getRow(1).eachCell(cell => {
    Object.assign(cell, questionHeaderStyle);
  });

  await workbook.xlsx.writeFile(filePath);
  console.log('✅ Excel report generated:', `${process.env.BACKEND_URI}/uploads/${fileName}`);
  return `${process.env.BACKEND_URI}/uploads/${fileName}`;
};

export default generateStyledExcel;