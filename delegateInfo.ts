// Import
import { ApiPromise, WsProvider } from '@polkadot/api';
import { AccountId } from "@polkadot/types/interfaces";
import { NeuronInfoLite, RawMetagraph, DelegateInfo, DelegateInfoRaw, SubnetInfo, Metagraph, DelegateExtras } from "./types";
// add event handlers for api?
// Construct
const wsProvider = new WsProvider("wss://entrypoint-finney.opentensor.ai:443");
const api = await ApiPromise.create({rpc: {delegateInfo: {
    getDelegates: {
      description: 'Get delegates info',
      params: [],
      type: 'Vec<u8>',
}}}, 
    types: {DelegateInfo: {
    delegate_ss58: 'AccountId',
    take: 'Compact<u16>',
    nominators: 'Vec<(AccountId, Compact<u64>)>', // map of nominator_ss58 to stake amount
    owner_ss58: 'AccountId',
    registrations: 'Vec<Compact<u16>>', // Vec of netuid this delegate is registered on
    validator_permits: 'Vec<Compact<u16>>', // Vec of netuid this delegate has validator permit on
    return_per_1000: 'Compact<u64>', // Delegators current daily return per 1000 TAO staked minus take fee
    total_daily_return: 'Compact<u64>', // Delegators current daily return
  }},
    provider: wsProvider
});

// Do something
//console.log(api.genesisHash.toHex());

//console.log(api)
const validatorAddress = '5Dkv87qjGGF42SNhDAep6WZp65E29c2vUPUfDBGDNevENCMs';

const result_bytes = await (api.rpc as any).delegateInfo.getDelegates();
const result = api.createType("Vec<DelegateInfo>", result_bytes);
const delegate_info_raw: DelegateInfoRaw[] = result.toJSON() as any[] as DelegateInfoRaw[];
//console.log(delegate_info_raw)
let d = {}
for (let j = 0; j < delegate_info_raw.length; j++) {
    let nominators: [string, number][] = [];
    let total_stake = 0;
    if (delegate_info_raw[j].owner_ss58.toString() == '5F1KNLWyXhm2oQ8D4A4fnSonRTgwgDEX1HgDgATYiT7jRAUK') {
      for (let i = 0; i < delegate_info_raw[j].nominators.length; i++) {
        const nominator = delegate_info_raw[j].nominators[i];
        const staked = nominator[1];
        total_stake += staked;
        nominators.push([nominator[0].toString(), staked]);
      }
    d = {
      take: delegate_info_raw[j].take / (2**16 - 1), // Normalize take, which is a u16
      delegate_ss58: delegate_info_raw[j].delegate_ss58.toString(),
      owner_ss58: delegate_info_raw[j].owner_ss58.toString(),
      nominators,
      total_stake,
    }};
};



console.log(d)





const validatorInfo1 = await api.query.subtensorModule.stake(validatorAddress, '5F1KNLWyXhm2oQ8D4A4fnSonRTgwgDEX1HgDgATYiT7jRAUK')
const validatorInfo2 = await api.query.subtensorModule.delegates(validatorAddress)
const validatorInfo = await api.query.subtensorModule.difficulty(1)

//console.log(validatorInfo1.toString())
//console.log(validatorInfo2.toString())
//console.log(validatorInfo.toString())
//const { exposure } = validatorInfo[0].stakingLedger;

