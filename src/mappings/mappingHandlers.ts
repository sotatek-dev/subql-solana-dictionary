import { uuid } from "uuidv4";
import { Transaction } from "../types";

// const fs = require('fs');

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
    let record = await Transaction.get(id);
    if (!record) {
      //Create a new starterEntity with ID using block hash
      record = await new Transaction(id);
    }
    // Record block number
    record.blockHash = blockhash ? blockhash.toString() : "";
    record.slot = blockSlot ? +blockSlot : 0;
    record.blockHeight = blockHeight ? +blockHeight : 0;
    record.signature = transactions[i].transaction.signatures[0]
      ? transactions[i].transaction.signatures[0]
      : "";
    record.programId = transactions[i].meta.logMessages
      ? ([
          ...new Set(
            transactions[i].meta.logMessages.map((log) => log.split(" ")[1])
          ),
        ] as string[])
      : [""];
    record.status = transactions[i].meta.status.Err ? "ERR" : "OK";
    records.push(record);
  }
  store.bulkCreate("Transaction", records);
}

// export async function handleBlock(block: any): Promise<void> {
//   const transactions = block.block.block.transactions;
//   const records: any = await transactions.map(async (transaction) => {
//     let record = await Transaction.get(
//         new Date().getTime().toString() +
//         Math.floor(1000 + Math.random() * 9000).toString()
//     );
//     const status = transaction.meta.status.Err ? "ERR" : "OK";
//     if (!record) {
//       //Create a new starterEntity with ID using block hash
//       record = new Transaction(
//           new Date().getTime().toString() +
//           Math.floor(1000 + Math.random() * 9000).toString()
//       );
//     }
//     //Record block number
//     record.field1 = block.block.block.blockHeight;
//     record.status = status;
//     return record;
//   });
//   store.bulkCreate("Transaction", records);
// }

// export async function handleBlock(block: any): Promise<void> {
//     // console.log("============ run handleBlock", block.block.block.transactions[i].meta.status);
//     const metaStatus = block.block.block.transactions[i].meta.status;
//     const status = metaStatus.Err ? 'ERR' : 'OK';
//     // console.log("============ run transction", JSON.stringify(block.block.block.transactions));
//     let record = await Transaction.get(block.block.block.blockhash);
//     if (!record) {
//         //Create a new starterEntity with ID using block hash
//         record = new Transaction(block.block.block.blockhash);
//     }
//     //Record block number
//     record.field1 = 233;
//     record.status = status;;
//     await record.save();
// }

// export async function handleTransaction(transaction: any): Promise<void> {
//     // console.log("================ run handleTransaction : ",transaction);
//     // let record = await Transaction.get(transaction.transaction.message.recentBlockhash);
//     // record.field1 = 97497307;
//     // record.field2 = JSON.stringify(transaction.transaction.message);
//     // record.field3 = transaction.meta.fee;
//     // await record.save();
// }
