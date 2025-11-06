import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YourContract".
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Este é o deploy simples, sem argumentos (args)
  await deploy("YourContract", {
    from: deployer,
    args: [], // Passa um array vazio de argumentos
    log: true,
    autoMine: true,
  });

  // Opcional: Mostra no console o contrato
  const yourContract = await hre.ethers.getContract<Contract>("YourContract", deployer);
  console.log("👋 Contrato 'YourContract' implantado em:", await yourContract.getAddress());
};

export default deployYourContract;

deployYourContract.tags = ["YourContract"];