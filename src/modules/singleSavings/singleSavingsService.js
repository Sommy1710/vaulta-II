//import { SingleSavings } from "./singleSavingsSchema.js";
//import { User } from "../auth/user.schema.js";
import {prisma} from "../../config/db.prisma.js";


export const createSingleSavingsPlan = async (
  userId,
  amount
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const interestRate = 10;
  const expectedInterest = (amount * interestRate) / 100;
  const totalPayout = amount + expectedInterest;

  const maturityDate = new Date();
  maturityDate.setMinutes(maturityDate.getMinutes() + 2);

  /*const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + 21);*/

  return await prisma.singleSavings.create({
    data: {
      userId: user.id,

      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,

      amountSaved: amount,
      interestRate,
      expectedInterest,
      totalPayout,

      maturityDate,
    },
  });
};
