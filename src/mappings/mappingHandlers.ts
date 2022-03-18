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
      //Create a new Transaction with ID using block hash
      record = await new Transaction(id);
    }
    // Record block number
    record.blockHash = blockhash ? blockhash.toString() : "";
    record.slot = blockSlot ? +blockSlot : 0;
    record.blockHeight = blockHeight ? +blockHeight : 0;
    record.signature = transactions[i].transaction.signatures[0]
      ? transactions[i].transaction.signatures[0]
      : null;
    if (transactions[i].meta) {
      record.programId = transactions[i].meta.logMessages
        ? ([
            ...new Set(
              transactions[i].meta.logMessages.map((log) => log.split(" ")[1])
            ),
          ] as string[])
        : null;
      record.status = Object.keys(transactions[i].meta.status).length
        ? Object.keys(transactions[i].meta.status)[0]
        : null;
    }

    records.push(record);
  }
  store.bulkCreate("Transaction", records);
}