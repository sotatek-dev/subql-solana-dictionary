import { Transaction } from "../types";

function makeId(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const getSolanaAddress = (value: string) => {
  return value.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g);//reference: https://docs.solana.com/integrations/exchange
};

const getInstruction = (value: string) => {
  const result = value.match(/Instruction:/g);
  if (result) {
    return value.split(" ").pop();
  }
  return result;
};

export async function handleBlock(block: any): Promise<void> {
  if (!block) {
    return;
  }
  if (!block.block) {
    return;
  }
  const blockValue = block.block;
  const transactions = blockValue.transactions;
  const blockhash = blockValue.blockhash;
  const blockHeight = blockValue.blockHeight;
  const blockSlot = blockValue.parentSlot + 1;
  const records: any = [];
  for (let i = 0; i < transactions.length; i++) {
    const id = makeId(40);
    let record = await new Transaction(id);
    // await Transaction.get(id);
    // if (!record) {
    //   //Create a new Transaction with ID using block hash
    //   record = await new Transaction(id);
    // }
    // Record block number
    record.blockHash = blockhash ? blockhash.toString() : "";
    record.slot = blockSlot ? +blockSlot : 0;
    record.blockHeight = blockHeight ? +blockHeight : 0;
    record.signature = transactions[i].transaction.signatures[0]
      ? transactions[i].transaction.signatures[0]
      : null;
    if (transactions[i].meta) {
      if (transactions[i].meta.logMessages) {
        record.programId = [...transactions[i].meta.logMessages.reduce((programs, log) => {
            const solanaProgram = getSolanaAddress(log);
            if (solanaProgram && solanaProgram.length) {
              programs.add(solanaProgram[0])
            }
            return programs;
        }, new Set())] as string[];

        record.instruction = [...transactions[i].meta.logMessages.reduce((instructions, log) => {
            const solanaInstruction = getInstruction(log);
            if (solanaInstruction) {
              instructions.add(solanaInstruction)
            }
            return instructions;
        }, new Set())] as string[];
      } else {
        record.programId = null;
        record.instruction = null;
      }

      record.status = Object.keys(transactions[i].meta.status).length
        ? Object.keys(transactions[i].meta.status)[0]
        : null;
    }

    records.push(record);
  }
  store.bulkCreate("Transaction", records);
}