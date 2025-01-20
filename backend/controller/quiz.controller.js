import quizModel from "../model/quiz.model";

export const CreateQuiz = async (req,res) =>{
    try {
        const newQuiz = await quizModel.create(req.body)
        if (!newQuiz){
            return res.status(400).json({message: "Invalid request",status:false});
        }
        res.status(201).json({data:newQuiz,status:true});
    } catch (error) {
        res.status(500).json({message: error.message,status:false});
    }
}