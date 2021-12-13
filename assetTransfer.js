/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');


class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const assets = [
        { ID: '1', first_name: 'Car', last_name: 'Gartsyde', address: '95626 American Ash Point', email: 'cgartsyde0@scribd.com', gender: 'Genderqueer', blood_group: 'A+', phone_number: '339-670-2138', emergency_phone_number: '393-775-9395' },
        { ID: '2', first_name: 'Barrett', last_name: 'Parkinson', address: '56140 Mayfield Place', email: 'bparkinson1@wsj.com', gender: 'Male', blood_group: 'A+', phone_number: '166-680-3331', emergency_phone_number: '881-251-8670' },
        { ID: '3', first_name: 'Jeanna', last_name: 'Van den Velden', address: '707 Jenifer Drive', email: 'jvandenvelden2@biblegateway.com', gender: 'Bigender', blood_group: 'A+', phone_number: '634-968-8846', emergency_phone_number: '300-692-4657' },
        { ID: '4', first_name: 'Jabez', last_name: 'Giron', address: '706 Roth Junction', email: 'jgiron3@patch.com', gender: 'Genderqueer', blood_group: 'A+', phone_number: '627-973-9495', emergency_phone_number: '565-502-1174' },
        { ID: '5', first_name: 'Mycah', last_name: 'MacAndrew', address: '86 Mosinee Crossing', email: 'mmacandrew4@gov.uk', gender: 'Non-binary', blood_group: 'A+', phone_number: '937-327-9051', emergency_phone_number: '924-402-0542' },
        { ID: '6', first_name: 'Saunder', last_name: 'Cranston', address: '250 Moose Court', email: 'scranston5@goo.ne.jp', gender: 'Male', blood_group: 'A+', phone_number: '254-219-9419', emergency_phone_number: '502-925-9980' },
        { ID: '7', first_name: 'Mignonne', last_name: 'Messom', address: '25440 Rigney Court', email: 'mmessom6@qq.com', gender: 'Polygender', blood_group: 'A+', phone_number: '414-796-5707', emergency_phone_number: '593-170-2663' },
        { ID: '8', first_name: 'Wilow', last_name: 'Culshaw', address: '27934 Grayhawk Drive', email: 'wculshaw7@wufoo.com', gender: 'Bigender', blood_group: 'A+', phone_number: '696-839-8069', emergency_phone_number: '799-347-1967' },
        { ID: '9', first_name: 'Grete', last_name: 'Broseke', address: '76498 Hallows Alley', email: 'gbroseke8@tuttocitta.it', gender: 'Genderfluid', blood_group: 'A+', phone_number: '426-263-5140', emergency_phone_number: '124-533-6845' },
        { ID: '10', first_name: 'Amandi', last_name: 'Stoppard', address: '27 Donald Crossing', email: 'astoppard9@bandcamp.com', gender: 'Non-binary', blood_group: 'A+', phone_number: '936-820-9485', emergency_phone_number: '277-646-9288' }];
        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, asset) {
        await ctx.stub.putState(JSON.parse(asset).ID, asset);
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON;
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, id, newOwner) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        asset.Owner = newOwner;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


}

module.exports = AssetTransfer;
