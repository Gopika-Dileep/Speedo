import bcrypt from "bcrypt";

async function main() {
  const hash = await bcrypt.hash("gopika@123", 10);
  console.log(hash);
}

main();