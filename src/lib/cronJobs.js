
import cron from "node-cron";
import {prisma} from "../config/db.prisma.js";

const COMPOUND_INTERVAL = 21 * 24 * 60 * 60 * 1000; // 21 days
//FOR SINGLE SAVINGS PLAN
cron.schedule("* * * * *", async () => {
    console.log("=================================");
    console.log("Checking for matured savings plans...");
    console.log("Current Time:", new Date());
    console.log("=================================");

    const now = new Date();

    try {
        // Step 1: Mature active plans

        const activePlans = await prisma.singleSavings.findMany({
            where: {
                status: "ACTIVE",
                maturityDate: {
                    lte: now,
                },
            },
        });

        console.log(
            `Found ${activePlans.length} active plans ready to mature`
        );

        for (const plan of activePlans) {
            console.log(`Maturing plan: ${plan.id}`);

            await prisma.singleSavings.update({
                where: {
                    id: plan.id,
                },
                data: {
                    status: "MATURED",
                    lastCompoundedAt: now,
                },
            });

            console.log(
                `Plan ${plan.id} matured successfully`
            );
        }

        // Step 2: Compound matured plans

        const maturedPlans =
            await prisma.singleSavings.findMany({
                where: {
                    status: "MATURED",
                    amountSaved: {
                        gte: 100,
                    },
                },
            });

        console.log(
            `Found ${maturedPlans.length} matured plans`
        );

        for (const plan of maturedPlans) {
            console.log("---------------------------------");
            console.log("Checking plan:", plan.id);
            console.log("Status:", plan.status);
            console.log("Amount Saved:", plan.amountSaved);
            console.log("Current Payout:", plan.totalPayout);
            console.log("Interest Rate:", plan.interestRate);
            console.log(
                "Last Compounded At:",
                plan.lastCompoundedAt
            );

            // Initialize lastCompoundedAt
            if (!plan.lastCompoundedAt) {
                console.log(
                    `Plan ${plan.id} has no lastCompoundedAt. Initializing...`
                );

                await prisma.singleSavings.update({
                    where: {
                        id: plan.id,
                    },
                    data: {
                        lastCompoundedAt: now,
                    },
                });

                continue;
            }

            const elapsed =
                now.getTime() -
                plan.lastCompoundedAt.getTime();

            console.log(
                "Elapsed Time (ms):",
                elapsed
            );

            console.log(
                "Required Time (ms):",
                COMPOUND_INTERVAL
            );

            if (elapsed >= COMPOUND_INTERVAL) {
                const interest =
                    (plan.totalPayout *
                        plan.interestRate) /
                    100;

                const newTotalPayout =
                    plan.totalPayout + interest;

                const newExpectedInterest =
                    plan.expectedInterest + interest;

                console.log(
                    "Interest to Add:",
                    interest
                );

                await prisma.singleSavings.update({
                    where: {
                        id: plan.id,
                    },
                    data: {
                        totalPayout: newTotalPayout,
                        expectedInterest:
                            newExpectedInterest,
                        lastCompoundedAt: now,
                    },
                });

                console.log(
                    `Plan ${plan.id} compounded successfully`
                );
            } else {
                console.log(
                    `Plan ${plan.id} not ready for compounding yet`
                );
            }
        }
    } catch (error) {
        console.error(
            "Savings cron job error:",
            error
        );
    }
});

//FOR DUO SAVINGS PLAN
cron.schedule("* * * * *", async () => {
  console.log("=================================");
  console.log("Checking Duo Savings plans...");
  console.log("Current Time:", new Date());
  console.log("=================================");

  const now = new Date();

  try {
    // =====================================
    // STEP 1: MATURE ACTIVE PLANS
    // =====================================

    const activePlans =
      await prisma.duoSavings.findMany({
        where: {
          status: "ACTIVE",
          maturityDate: {
            lte: now,
          },
        },
      });

    console.log(
      `Found ${activePlans.length} active plans ready to mature`
    );

    for (const plan of activePlans) {
      console.log(
        `Maturing Duo Savings plan: ${plan.id}`
      );

      const interest =
        (plan.amountSaved * plan.interestRate) /
        100;

      const totalPayout =
        plan.amountSaved + interest;

      await prisma.duoSavings.update({
        where: {
          id: plan.id,
        },
        data: {
          status: "MATURED",
          expectedInterest: interest,
          totalPayout,
          lastCompoundedAt: now,
        },
      });

      console.log(
        `Duo Savings plan ${plan.id} matured successfully`
      );
    }

    // =====================================
    // STEP 2: COMPOUND MATURED PLANS
    // =====================================

    const maturedPlans =
      await prisma.duoSavings.findMany({
        where: {
          status: "MATURED",
        },
      });

    console.log(
      `Found ${maturedPlans.length} matured plans`
    );

    for (const plan of maturedPlans) {
      console.log("---------------------------------");
      console.log("Checking Plan:", plan.id);
      console.log(
        "Current Payout:",
        plan.totalPayout
      );

      if (!plan.lastCompoundedAt) {
        console.log(
          `Plan ${plan.id} has no lastCompoundedAt`
        );

        await prisma.duoSavings.update({
          where: {
            id: plan.id,
          },
          data: {
            lastCompoundedAt: now,
          },
        });

        continue;
      }

      const elapsed =
        now.getTime() -
        plan.lastCompoundedAt.getTime();

      console.log("Elapsed:", elapsed);

      // Compound every 2 minutes
      if (elapsed >= COMPOUND_INTERVAL) {
        const interest =
          (plan.totalPayout *
            plan.interestRate) /
          100;

        const newExpectedInterest =
          plan.expectedInterest + interest;

        const newTotalPayout =
          plan.totalPayout + interest;

        await prisma.duoSavings.update({
          where: {
            id: plan.id,
          },
          data: {
            expectedInterest:
              newExpectedInterest,
            totalPayout: newTotalPayout,
            lastCompoundedAt: now,
          },
        });

        console.log(
          `Plan ${plan.id} compounded successfully`
        );

        console.log(
          `Interest Added: ${interest}`
        );

        console.log(
          `New Total Payout: ${newTotalPayout}`
        );
      } else {
        console.log(
          `Plan ${plan.id} not ready for compounding`
        );
      }
    }
  } catch (error) {
    console.error(
      "Duo Savings cron job error:",
      error
    );
  }
});


//FOR FAMILY SAVINGS PLAN
cron.schedule("* * * * *", async () => {
  console.log("=================================");
  console.log("Checking Family Savings plans...");
  console.log("Current Time:", new Date());
  console.log("=================================");

  const now = new Date();

  try {
    // =====================================
    // STEP 1: MATURE ACTIVE PLANS
    // =====================================

    const activePlans =
      await prisma.familySavings.findMany({
        where: {
          status: "ACTIVE",
          maturityDate: {
            lte: now,
          },
        },
      });

    console.log(
      `Found ${activePlans.length} active plans ready to mature`
    );

    for (const plan of activePlans) {
      console.log(
        `Maturing Family Savings plan: ${plan.id}`
      );

      const interest =
        (plan.amountSaved * plan.interestRate) /
        100;

      const totalPayout =
        plan.amountSaved + interest;

      await prisma.familySavings.update({
        where: {
          id: plan.id,
        },
        data: {
          status: "MATURED",
          expectedInterest: interest,
          totalPayout,
          lastCompoundedAt: now,
        },
      });

      console.log(
        `Family Savings plan ${plan.id} matured successfully`
      );
    }

    // =====================================
    // STEP 2: COMPOUND MATURED PLANS
    // =====================================

    const maturedPlans =
      await prisma.familySavings.findMany({
        where: {
          status: "MATURED",
        },
      });

    console.log(
      `Found ${maturedPlans.length} matured plans`
    );

    for (const plan of maturedPlans) {
      console.log("---------------------------------");
      console.log("Checking Plan:", plan.id);
      console.log(
        "Current Payout:",
        plan.totalPayout
      );

      if (!plan.lastCompoundedAt) {
        console.log(
          `Plan ${plan.id} has no lastCompoundedAt`
        );

        await prisma.familySavings.update({
          where: {
            id: plan.id,
          },
          data: {
            lastCompoundedAt: now,
          },
        });

        continue;
      }

      const elapsed =
        now.getTime() -
        plan.lastCompoundedAt.getTime();

      console.log("Elapsed:", elapsed);

      // Compound every 2 minutes
      if (elapsed >= COMPOUND_INTERVAL) {
        const interest =
          (plan.totalPayout *
            plan.interestRate) /
          100;

        const newExpectedInterest =
          plan.expectedInterest + interest;

        const newTotalPayout =
          plan.totalPayout + interest;

        await prisma.familySavings.update({
          where: {
            id: plan.id,
          },
          data: {
            expectedInterest:
              newExpectedInterest,
            totalPayout: newTotalPayout,
            lastCompoundedAt: now,
          },
        });

        console.log(
          `Plan ${plan.id} compounded successfully`
        );

        console.log(
          `Interest Added: ${interest}`
        );

        console.log(
          `New Total Payout: ${newTotalPayout}`
        );
      } else {
        console.log(
          `Plan ${plan.id} not ready for compounding`
        );
      }
    }
  } catch (error) {
    console.error(
      "Family Savings cron job error:",
      error
    );
  }
});