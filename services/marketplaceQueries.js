
var db = require('../utils/connection');
const config = require('../config');

module.exports = {
    getWalletDetail : "select u.id as user_id,'' as public,'' as private,coalesce(sum(t.token),0) as balance,coalesce(sum(t.amount),0) as inr_balance from users as u left join transaction as t on t.user_id=u.id and t.status=1 and transaction_type_id in (13,1,8) where u.id=? group by u.id,public",
    getWalletTransaction :"SELECT t.id as transaction_id,tt.name as transaction_type,t.transaction_type_id,u.full_name,t.to_address,i.id as item_id,t.item_edition_id,i.name as item_name,i.file_type,i.description,i.image,COALESCE(abs(t.amount),0) as amount,COALESCE(abs(t.token),0) as token, t.currency,date_format(t.datetime,'%d-%M-%y') as transaction_date  FROM transaction as t left join users as u on u.id=t.user_id left join item_edition as ie on ie.id=t.item_edition_id left join item as i on i.id=ie.item_id left join transaction_type as tt on tt.id=t.transaction_type_id where t.user_id=? and t.transaction_type_id in (1,3,10,8,12,13) and (t.amount<>0 or token<>0) order by t.id desc",
    insertBuyTransactionByItemId : "INSERT INTO transaction (user_id,item_id,item_edition_id,token,transaction_type_id,amount,status,user_address,blockchain_status)select ?,i.id,ie.id,?,6,? as price,1,?,0 from item_edition as ie left join item as i on i.id=ie.item_id where ie.id =?",
    insertSellTransactionByItemId : "INSERT INTO transaction (user_id,item_id,item_edition_id,transaction_type_id,amount,currency,status,user_address,commission_percent,commission) select ie.owner_id,i.id,ie.id as item_edition_id,1 as transaction_type_id, ? as price,'USD' AS currency,1,?,?,?  from item_edition as ie left join item as i on i.id=ie.item_id where ie.id=?",
    insertRoyaltyTransactionByItemId : "INSERT INTO transaction (user_id,item_id,item_edition_id,transaction_type_id,amount,currency,status) select i.created_by,i.id,ie.id as item_edition_id,8 as transaction_type_id,? as price,'USD' AS currency,1 as status from item_edition as ie left join item as i on i.id=ie.item_id where ie.id=?",

    createFolder :"insert into bulk_nft_master SET ?",
  
    getUserOwnerItem :"Select it.id as item_id,it.address,t.purchased_quantity, ie.id as item_edition_id,ie.owner_id, it.name,it.is_on_sale,it.sell_type,it.approve_by_admin,it.description,it.image,it.file_type,it.owner,it.item_category_id,it.token_id,ie.price,cl.id as collection_id, cl.user_id,ie.is_sold,ie.expiry_date,ic.name as category_name,case when it.edition_type=2 then 'Open'  else ie.edition_text end as edition_text,t.blockchain_status from item_edition as ie left join item as it on it.id=ie.item_id   LEFT JOIN user_collection as cl ON cl.id = it.user_collection_id LEFT JOIN item_category as ic ON it.item_category_id=ic.id left join transaction as t on t.user_id=ie.owner_id and t.transaction_type_id=6 and t.item_edition_id=ie.id and t.blockchain_status=0  where ie.id in (select min(id) from item_edition where owner_id=? group by item_id,owner_id)",
    itemdetail : `SELECT ie.id as item_edition_id,i.nft_type as nft_type, i.id as item_id,i.commission_percent,i.unlockable_content,i.user_collection_id,i.address as itemaddress,i.coin_percentage,ucl.name as user_collection_name,ucl.description as user_collection_description,ucl.profile_pic as user_collection_pic,ie.id as item_edition_id,date_format(ie.expiry_date,'%d %M %Y') as expiry_date,ie.expiry_date as expiry_date1, ie.start_date,case when ie.owner_id=1 then st.public_key else uc.address end as publicaddress, ie.is_sold,ie.owner_id as user_id,itemViewCount(ie.id) as view_count,case when length(i.name)>=30 then concat(left(i.name,30),'...')  else i.name end as name,i.edition_type,imageArray(?) as image_array,case when i.edition_type=2 then 'Open'  else ie.edition_text end as edition_text,i.description,i.start_date,i.royalty_percent,i.image,i.image_original,i.metadata,i.file_type,uo.user_name as owner,uo.profile_pic as owner_profile_pic,ie.owner_id,i.created_by,uc.user_name as creator,uc.profile_pic as creator_profile_pic,i.item_category_id,i.sell_type, case when i.sell_type=1 then 'Price' else 'Auction' end as sell_type_name,ic.name as category_name,i.token_id,concat('https://mumbai.polygonscan.com/tx/',i.token_hash) as token_hash,ie.price, case when iel.id is null then 0 else 1 end as is_liked,itemLikeCount(i.id) as like_count,concat(case when ie.price>coalesce(bi.bid_price,0) then ie.price else bi.bid_price end,'') as max_bid,case when i.start_date<=CURRENT_DATE or i.start_date is null  then 'Live' else 'Upcoming' end as nft_type1,i.start_date,i.end_date,isResale(ie.id) as is_resale,getUserUnsoldNFT(uo.id,i.id) as available_quantity,concat('${config.explorerLink}assetsdetails/',ie.id,'/',ie.owner_id) as explorer_link,concat('${config.mailUrl}backend/infinity8_backend/uploads/',i.local_image) as local_image from item_edition as ie left join item as i on i.id=ie.item_id left join user_collection as ucl on i.user_collection_id = ucl.id left join item_category as ic on ic.id=i.item_category_id  LEFT JOIN item_edition_like as iel on iel.item_edition_id=ie.id and iel.user_id= ? left join (select item_edition_id,max(bid_price) as bid_price from  item_edition_bid where item_edition_id=? and status=0) as bi on bi.item_edition_id=ie.id left join users as uo on uo.id=ie.owner_id left join users as uc on uc.id=i.created_by cross join settings as st where ie.id = ? and i.is_active=1`,

    rejectBid : "UPDATE item_edition_bid set status=3 where id = ?",
    refundBidAmount :"insert into transaction (user_id,item_edition_id,transaction_type_id,amount,currency,item_edition_bid_id,status) select user_id,item_edition_id,12 as transaction_type_id,bid_price,'ETH' AS currency,id,1 as status from item_edition_bid where id=? ",
    ownerDetail   : "select u.address, u.id as user_id,isResale(?) as is_resale from users as u where u.id in (select owner_id from item_edition where id=?)",
    updateSoldPaypal :  "update item_edition SET  is_sold = ?,owner_id=? where id=?",
    updateTransferHash : "update item_edition SET  transfer_hash= ? where id=?",
    insertBid : "insert into item_edition_bid SET ?",
    getLastBid : "select * from item_edition_bid where item_edition_id=? order by id desc limit 1",
    insertBidTransactionByItemId : "INSERT INTO transaction (user_id,item_edition_id,item_edition_bid_id,transaction_type_id,amount,payment_id,receipt_url,status)select user_id,item_edition_id,id,4,bid_price*-1,payment_id,receipt_url,0 from item_edition_bid where id =?",
    getUsersByEmail : "Select id,user_name,email from users where  id =?",
    getitems : "SELECT i.id,i.name,i.description,i.edition_type,i.image,i.file_type,u.full_name as owner,date_format(i.expiry_date,'%d-%M-%y %H:%i:%s') as expiry_date FROM `item` as i left join users as u on u.id=i.owner_id where i.id=?",
    updateTrxidInBid :"update item_edition_bid set transaction_id=? where id=?",
    getUserBids:"select ib.id as bid_id,t.id as transaction_id,u.id as user_id,u.full_name,u.email,i.id as item_id,ie.id as item_edition_id,i.name as item_name,i.edition_type,i.description,i.image,i.file_type,ib.bid_price,case when ib.status=2 then 'Cancelled' else case when COALESCE(getMaxBid(ie.id),0)> ib.bid_price then 'Outbid' else  case when ib.status=0 then 'Pending' when ib.status=1 then 'Accepted' else 'Outbid' end end end as status,ib.status as status_id,case when i.sell_type=1 then 'Open Edition' else 'Auction' end as bid_type,date_format(ib.datetime,'%d-%M-%y') as bid_datetime,date_format(i.datetime,'%d-%M-%y') as nft_datetime,cu.full_name as creator from transaction as t inner join  item_edition_bid as ib on ib.transaction_id=t.id  and ib.user_id=? left join item_edition as ie on ie.id=ib.item_edition_id left join item as i on i.id=ie.item_id left join users as u on u.id=ib.user_id  left join users as cu on cu.id=i.created_by  where t.user_id=? and t.transaction_type_id=4  order by ib.id desc",
    getBidDetail : "Select bd.id as bid_id,u.id as user_id,u.full_name,u.profile_pic,u.address,ie.id as item_edition_id,it.id as item_id,it.name as item_name,it.edition_type,bd.bid_price,DATE_FORMAT(bd.datetime,'%d-%M-%Y %H:%i:%s') AS datetime,bd.payment_id from item_edition_bid as bd left join item_edition as ie on ie.id=bd.item_edition_id LEFT JOIN item as it ON it.id = ie.item_id LEFT JOIN users as u ON bd.user_id=u.id  where bd.id in (select max(id) from item_edition_bid where item_edition_id= ? and status=0 group by user_id) order by bd.id desc, bd.user_id Desc",
    resaleNFT : "update item_edition set ? where id =?",
    insertItemAttr:"insert into item_properties SET ?",
    insertTransaction : "insert into transaction SET ?",
    getCollectionAlreadyExist : 'SELECT name FROM user_collection where name = ?',
    checkUser : "SELECT id,address,email from users where email =?",
    checkItem : "SELECT i.id as item_id,i.productId,ie.id as item_edition_id,ie.user_address as owner_address from item as i inner join (select id,item_id,owner_id,user_address from item_edition where item_id in (select id from item where productId=?) and is_sold=0 order by id limit 1) as ie on ie.item_id=i.id where i.productId=? and i.user_collection_id in (SELECT id from user_collection where name=?)",
    insertList : "INSERT INTO transfer_list SET ?",

    getbankdetail :"select * from user_bank_detail where user_id=?", 
    updatebankdetail :"update user_bank_detail SET ? where user_id=?",
    addbankdetail :"insert into user_bank_detail SET ?",





















    updateSoldStripe :  "update item_edition SET  is_sold = ?,owner_id=?,payment_id=?,receipt_url=?,user_address=? where id=?",

    getSettingData : "select * from settings",
    getUserDetail:"select * from users where id =?",
    addTelent : "insert into telent SET ?",
    addRealEstateUser : "insert into real_estate_user SET ?",
    listWishlist : "select uw.id as wishlist_id,u.id as user_id,u.email,i.name,i.edition_type,i.description,i.image,i.file_type,ic.name as item_category,i.token_id,i.price,i.is_sold,i.is_trending from user_wishlist as uw left join users as u on u.id=uw.user_id left join item as i on i.id=uw.item_id left join item_category as ic on ic.id=i.item_category_id where uw.user_id = ?",
    removeWishlist: "DELETE FROM user_wishlist where id= ?",
    addCart : "insert into user_cart SET ?",
    listCart : "select uc.id as cart_id,u.id as user_id,u.email,i.name,i.edition_type,i.owner,i.description,i.image,i.file_type,ic.name as item_category,i.token_id,i.price,i.is_sold,i.is_trending,cart_total(?) as cart_total from user_cart as uc left join users as u on u.id=uc.user_id left join item as i on i.id=uc.item_id left join item_category as ic on ic.id=i.item_category_id where uc.user_id = ?",
    removeCart: "DELETE FROM user_cart where id= ?",
   // itemdetail : "SELECT i.id,i.created_by as user_id,itemViewCount(i.id) as view_count,i.name,i.description,i.image,u.full_name as owner,i.item_category_id,i.sell_type, case when i.sell_type=1 then 'Price' else 'Auction' end as sell_type_name,ic.name as category_name,i.token_id,concat('https://mumbai.polygonscan.com/tx/',i.token_hash) as token_hash,i.price, case when il.id is null then 0 else 1 end as is_liked,itemLikeCount(i.id) as like_count,concat(coalesce(bi.bid_price,i.price),'') as max_bid,case when i.start_date<=CURRENT_DATE or i.start_date is null  then 'Live' else 'Upcoming' end as nft_type,i.start_date,i.end_date from item as i left join item_category as ic on ic.id=i.item_category_id  LEFT JOIN item_like as il on il.item_id=i.id and il.user_id= ? left join (select item_id,max(bid_price) as bid_price from  item_bid where item_id=?) as bi on bi.item_id=i.id left join users as u on u.id=i.owner_id where i.id = ?",
   

   
   ItemDetailForEdit :"SELECT i.id as item_id,i.name,i.description,i.image,i.file_type,ic.name as item_category_name,i.item_category_id,i.price,i.sell_type,i.edition_type,date_format(i.expiry_date,'%m/%d/%Y') as expiry_date,i.quantity,date_format(i.start_date,'%m/%d/%Y') as start_date from item as i left join item_category as ic on ic.id=i.item_category_id where i.id=?",
   itemCategory:"Select i.*,case when length(i.name)>=30 then concat(left(i.name,30),'...')  else i.name end as name,ie.id as item_edition_id,i.price,ie.is_sold,ic.name as category_name,ie.edition_text from item_edition as ie left join item as i on i.id=ie.item_id left join item_category as ic on i.item_category_id=ic.id where i.item_category_id = ? and ie.id !=? and i.is_active=1 and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id) limit 3 ",
   updateRealEstateUser :  "Update real_estate_user SET  first_name=?,last_name=?,email=?,country_id=?,city=?,description=?,website=?,insta=?  where id = ?",
   getRealEstate :"select rs.id,u.full_name,rs.first_name,rs.last_name,rs.email,rs.country_id,c.name as country_name,rs.city,rs.description,rs.website,rs.insta from real_estate_user as rs left join users as u on u.id=rs.user_id left join country as c on c.id=rs.country_id order by rs.id desc",
   getUserRealEstate :"select rs.id,u.full_name,rs.first_name,rs.last_name,rs.email,rs.country_id,c.name as country_name,rs.city,rs.description,rs.website,rs.insta from real_estate_user as rs left join users as u on u.id=rs.user_id left join country as c on c.id=rs.country_id where user_id=?",
   getUserTalentById : "Select t.*, u.user_name,u.banner,u.profile_pic,u.telent_status from telent as t left Join users as u ON t.user_id=u.id where t.user_id=?",
   updateTalentUser :  "Update telent SET  first_name=?,last_name=?,email=?,description=?,facebook=?,youtube=?,twitter=?,insta=?,country_id=?,city=?,follower=? where id = ?",
    itemView : "insert into item_edition_view set ?",
    getImages : "SELECT * from (select file_type,image from item where id in (select item_id from item_edition where id =?) union all select 'image' as file_type,name as image from item_images where item_id in (select item_id from item_edition where id =?) limit 4 )as a",
    getProperties : "SELECT * from item_properties where item_id in (select item_id from item_edition where id =?)",
    insertUserCollection : "insert into user_collection SET ?",
    getUserCollection: "SELECT uc.id, getNFTCountByCollection(uc.id) as totalNft , uc.name,uc.description,uc.datetime,uc.profile_pic,uc.banner,uc.is_featured,uc.is_featured,uc.website,uc.facebook,uc.insta,uc.telegram,uc.twitter,uc.discord FROM `user_collection` AS uc where uc.user_id = ? and is_hide=0 ORDER BY id DESC",
    getAllUserCollection : "Select uc.id as collection_id,u.id as user_id,u.full_name as user_name,u.profile_pic as user_profile_pic,u.email,uc.name as collection_name,uc.description,uc.is_featured,uc.profile_pic,uc.banner,uc.website,uc.facebook,uc.twitter,uc.insta,uc.telegram,uc.discord,date_format(uc.datetime,'%d-%M-%y')as create_date,CollectionNFTCount(uc.id) as nftCount from user_collection as uc left join users as u on u.id=uc.user_id order by uc.id desc",
    getRoyaltyTransaction :"SELECT t.id as transaction_id,tt.name as transaction_type,t.transaction_type_id,u.full_name,i.id as item_id,t.item_edition_id,i.name as item_name,i.description,i.image,t.amount,t.currency,date_format(t.datetime,'%d-%M-%y') as transaction_date  FROM transaction as t left join users as u on u.id=t.user_id left join item_edition as ie on ie.id=t.item_edition_id left join item as i on i.id=ie.item_id left join transaction_type as tt on tt.id=t.transaction_type_id where t.user_id=? and t.transaction_type_id=8 order by t.id desc",
    getAllRoyaltyTransaction :"SELECT t.id as transaction_id,tt.name as transaction_type,t.transaction_type_id,u.full_name,i.id as item_id,t.item_edition_id,i.name as item_name,i.description,i.image,t.amount,t.currency,date_format(t.datetime,'%d-%M-%y') as transaction_date  FROM transaction as t left join users as u on u.id=t.user_id left join item_edition as ie on ie.id=t.item_edition_id left join item as i on i.id=ie.item_id left join transaction_type as tt on tt.id=t.transaction_type_id where t.transaction_type_id=8 order by t.id desc",

    getMarketActivity : "select t.id as transaction_id,case when tt.id=6 then 'Purchased for ' when tt.id=14 then 'Transfer NFT for' when tt.id=4 then 'Placed an offer for ' when tt.id=2 then 'Accepted bid offer for  ' when tt.id=9 then 'Published for resell ' end as transaction_type,abs(t.amount) as amount, case when i.edition_type=2 then 'Open'  else concat('Edition : ',coalesce(t.edition_text,ie.edition_text)) end as edition_text,date_format(t.datetime,'%d %M %Y') as transaction_date,t.item_id,i.name,i.image,u.user_name,u.profile_pic,u.id as user_id From transaction as t left join transaction_type as tt on tt.id=t.transaction_type_id left join item_edition as ie on ie.id=t.item_edition_id left join item as i on i.id =ie.item_id left join users as u on u.id=t.user_id where i.id=? and transaction_type_id in (2,4,9,6,14) and t.status=1 union ALL select 0 as transaction_id,'Minted NFT for ' as transaction_type,i.price,case when i.edition_type=2 then 'Open'  else concat('Editions : ',getEditionCount(i.id)) end as edition_text,date_format(i.datetime,'%d %M %Y') as transaction_date,i.id as item_id,i.name,i.image,u.user_name,u.profile_pic,u.id as user_id from item as i left join users as u on u.id=i.created_by where i.id=? order by transaction_id desc",
    getRealEstateCollection : "Select id,user_id,name,description from user_collection where user_id =? and nft_type_id=2",
    
    getAllRealEstateCollection : "Select uc.id as collection_id,u.id as user_id,u.full_name as user_name,u.profile_pic,u.email,uc.name as collection_name,uc.description,date_format(uc.datetime,'%d-%M-%y')as create_date from user_collection as uc left join users as u on u.id=uc.user_id where uc.nft_type_id=2 order by uc.id desc",
    updateTelentForApproved : "update users SET telent_status=1 where id = ?",
    realEstateUserApprove: "update users SET real_estate_status=1 where id = ?",
    updateTelentForReject : "update users SET telent_status=2 where id = ?",
    realEstateUserReject : "update users SET real_estate_status=2 where id = ?",
    DeleteTelent :  "DELETE FROM telent WHERE user_id=?",
    DeleteRealEstateUser :  "DELETE FROM real_estate_user WHERE user_id=?",
    insertItem : "insert into item SET ?",
    getItemEdition :"select id from item_edition where item_id=? order by id limit 1",
    updateUsersAuth : "update users SET enableTwoFactor=? where id=?",
    getUserAuth : "Select googleAuthCode,enableTwoFactor,QR_code from users where id =?", 
    allSearch : "select t.user_id as id,t.email,concat(t.first_name,' ',t.last_name) as full_name,u.profile_pic,'image' as file_type,talent' as type from telent as t left join users as u on u.id=t.user_id where t.first_name like ? or t.last_name like ? union all select ie.id,null as email,i.name,i.image as profile_pic,i.file_type,'nft' as type from item_edition as ie left join item as i on i.id=ie.item_id where name like ?  and i.is_active=1",


    updateTransaction : "update transaction SET ? where id =?",
    updateTransactionStatus : "UPDATE transaction set status=2 where item_edition_bid_id = ?",

    updateSold : "update item_edition SET  is_sold = ?,owner_id=? where id=?",
    updateSold2 : "update item_edition SET  is_sold = ?,owner_id=?,transfer_hash=?, user_address=? where id=?",
    updateSoldMultiple : "update item_edition SET  is_sold = ?,owner_id=?,transfer_hash=?, user_address=? where id in (select id from item_edition where item_id=? and owner_id=? order by id limit ?)",

    //getItemDetails : "Select it.created_by,it.id,u.user_name from item as it LEFT JOIN users as u ON it.created_by=u.id where it.id =?", 
    
    getItemDetails : "Select i.created_by,i.edition_type,ie.id as item_edition_id,ie.is_sold,ie.expiry_date,ie.id as id,u.user_name from item_edition as ie left join item as i on i.id=ie.item_id LEFT JOIN users as u ON i.created_by=u.id where ie.id =?  and (ie.expiry_date >= now() or ie.expiry_date is null)",
    bidMailData :"select i.name,i.description,i.image,getUserFullName(?) as bidderName,getUserEmail(u.id) as ownerEmail from item_edition as ie left join item as i on i.id=ie.item_id left join users as u on u.id=ie.owner_id where ie.id=?",
    insertOwnerHistory : "insert into product_owner_history SET ?",
    getBidRecord : "select ieb.*,isResale(ieb.item_edition_id) as is_resale,u.address from item_edition_bid as ieb left join users as u on u.id=ieb.user_id where ieb.id =?",
    getTelentStatus : "Select telent_status from users where id =?",
    getRealEstateStatus:"Select real_estate_status from users where id =?",
    getPayoutAddress:"Select id as user_id,full_name,payout_address,getRoyaltyAmount(id) as royalty_amount from users where id =?",
    getRoyaltyList :"Select id as user_id,full_name,email,profile_pic,payout_address,getRoyaltyAmount(id) as royalty_amount from users where getRoyaltyAmount(id)>0",
    onlinetrx_start : "insert into onlinetrx SET ?",
    getUser : "Select * from users where id =?",
    updateOnlinetrx : "update onlinetrx set ? where transaction_id = ?",
    updateItem : "update item set ? where id = ?",
    placeBidByOnlinetrx : "INSERT INTO item_edition_bid(item_edition_id,user_id,bid_price,status,transaction_id)SELECT item_edition_id,user_id,bid_price,0,transaction_id from onlinetrx where transaction_id= ?",
    updateUser : "update users set ? where id= ?",

    //getUserBids : "select ib.id as bid_id,t.id as transaction_id,u.id as user_id,u.full_name,u.email,i.id as item_id,ie.id as item_edition_id,i.name as item_name,i.edition_type,i.description,i.image,i.file_type,ib.bid_price,case when getMaxBid(ie.id)> ib.bid_price then 'Outbid' else  case when ib.status=0 then 'Pending' when ib.status=1 then 'Accepted' else 'Outbid' end end as status,ib.status as status_id,case when i.sell_type=1 then 'Open Edition' else 'Auction' end as bid_type,date_format(ib.datetime,'%d-%M-%y') as bid_datetime,date_format(i.datetime,'%d-%M-%y') as nft_datetime,cu.full_name as creator from item_edition_bid as ib left join item_edition as ie on ie.id=ib.item_edition_id left join item as i on i.id=ie.item_id left join users as u on u.id=ib.user_id inner join transaction as t on  t.item_edition_bid_id=ib.id and t.user_id=? left join users as cu on cu.id=i.created_by where ib.user_id=? and ie.is_sold=0 order by ib.id desc",   
   getUserPurchase : "select distinct u.id as user_id,t.id as transaction_id,ie.is_sold,ie.owner_id,t.user_address,u.full_name,u.email,i.id as item_id,ie.id as item_edition_id,case when i.edition_type=2 then 'Open'  else ie.edition_text end as edition_text, i.edition_type,i.name as item_name,i.description,i.image,i.sell_type,i.file_type,abs(t.amount) as price,case when i.sell_type=1 then 'Open Edition' else 'Auction' end as bid_type,date_format(i.datetime,'%d-%M-%y') as nft_datetime,date_format(t.datetime,'%d-%M-%y') as purchase_datetime,concat('https://mumbai.polygonscan.com/tx/',ie.transfer_hash) as transfer_hash,cu.user_name as creator,coalesce(t.purchased_quantity,1) as purchased_quantity,case when i.edition_type=2 then 'Open' when t.edition_text is not null then t.edition_text  else ie.edition_text end as edition_text,getAvailableForResale(t.id,t.user_id) as resale_available from transaction as t left join item_edition as ie on ie.id=t.item_edition_id left join item as i on i.id=ie.item_id left join users as u on u.id=i.created_by left join users as cu on cu.id=i.created_by where t.user_id=? and t.transaction_type_id in (6,2) and t.status<>3   order by t.id desc",
    getUserSale : "select distinct u.id as user_id,u.user_name,u.email,i.id as item_id,ie.id as item_edition_id,i.name as item_name,i.description,i.edition_type,i.image,i.file_type,round(t.amount,6) as price,case when i.sell_type=1 then 'Open Edition' else 'Auction' end as bid_type,date_format(i.datetime,'%d-%M-%y') as nft_datetime,date_format(t.datetime,'%d-%M-%y') as purchase_datetime,concat('https://mumbai.polygonscan.com/tx/',ie.transfer_hash) as transfer_hash,cu.full_name as creator from item_edition as ie left join item as i on i.id=ie.item_id inner join transaction as t on t.item_edition_id=ie.id and t.user_id=? and t.transaction_type_id in (1) and t.status=1 left join users as u on u.id=ie.owner_id left join users as cu on cu.id=i.created_by where t.user_id=? and t.transaction_type_id=1  order by t.id desc",
    myBidItem : "SELECT i.id as item_id,ie.id as item_edition_id,i.edition_type,i.name,i.description,i.image,i.file_type,ic.name as item_category,ie.price,date_format(i.datetime,'%d-%M-%y') as create_date from item_edition as ie left join item as i on i.id=ie.item_id left join item_category as ic on ic.id=i.item_category_id where ie.owner_id=? and ie.is_sold=0 and ie.id in (select distinct item_edition_id from item_edition_bid where status=0 ) order by i.id desc",
    itemDetailByonlinetrx : "SELECT o.item_edition_id,o.user_id,o.bid_price,i.*,uw.public,ie.price from onlinetrx as o left join item as i on i.id=o.item_id left join item_edition as ie on ie.id=o.item_edition_id left join user_wallet as uw on uw.user_id=o.user_id where o.transaction_id=?",
    changeOwnership : "UPDATE item set ? where id =?",
    getfaq : "select id,question,answer from faq",
    getRecentWorks : "SELECT i.id,ie.id as item_edition_id,i.edition_type, i.name,i.image,i.file_type from item_edition as ie left join item as i on i.id=ie.item_id where ie.id in (select min(id) from item_edition where is_sold=0 group by item_id) and i.file_type='image' and i.is_active=1 order by rand() limit 15",
    allTalentList1 : "Select t.user_id,t.first_name,t.last_name,t.email,t.description,t.city,t.follower,ct.name as country_name,u.telent_status,u.profile_pic,ie.id as item_id,ie.item_edition_id,ie.image as image,ie.file_type from users as u left join telent as t on t.user_id=u.id  LEFT JOIN country as ct ON ct.id = t.country_id INNER join (select i.*,ie.id as item_edition_id from item_edition as ie left join item as i on i.id=ie.item_id where ie.item_id in (select max(id) from item group by created_by) and ie.id in (select min(id) from item_edition group by item_id )) as ie on ie.created_by=u.id where u.telent_status=1 and u.is_featured=? order by rand() limit 10",
    allTalentList2 : "Select t.user_id,t.first_name,t.last_name,t.email,t.description,t.city,t.follower,ct.name as country_name,u.telent_status,u.profile_pic,ie.id as item_id,ie.item_edition_id,ie.image as image,ie.file_type from users as u left join telent as t on t.user_id=u.id  LEFT JOIN country as ct ON ct.id = t.country_id INNER join (select i.*,ie.id as item_edition_id from item_edition as ie left join item as i on i.id=ie.item_id where ie.item_id in (select max(id) from item group by created_by) and ie.id in (select min(id) from item_edition group by item_id )) as ie on ie.created_by=u.id where u.telent_status=1 and u.is_featured=? order by rand()",
    getItemLike : "select * from item_edition_like where item_edition_id= ? and user_id = ?",
    deleteItemLike :"DELETE from item_edition_like where item_edition_id= ? and user_id = ?",
    insertItemLike : "INSERT INTO item_edition_like SET ?",




    insertBuyTransactionByBidId : "INSERT INTO transaction (user_id,item_edition_id,item_edition_bid_id,transaction_type_id,status,amount)select ?,item_edition_id,id,2,1,bid_price*-1 from item_edition_bid where id =?",
    insertSellTransactionByBidId : "INSERT INTO transaction (user_id,item_id,item_edition_id,transaction_type_id,amount,currency,status,item_edition_bid_id)select ie.owner_id as user_id,i.id as item_id,ie.id as item_edition_id,1 as transaction_type_id,ieb.bid_price*.7 as amount,'USD' as currency,1 as status,ieb.id as item_edition_bid_id from item_edition_bid  as ieb left join item_edition as ie on ie.id=ieb.item_edition_id left join item as i on i.id=ie.item_id where ieb.id =?",
    getItemLikeCount : "select count(iel.id) as count,case when i.id is null then 0 else 1 end as is_liked from item_edition_like as iel left join item_edition_like as i on i.item_edition_id=iel.item_edition_id and i.user_id=? where iel.item_edition_id=?",

    userWallet : "Select * from user_wallet where user_id =?",
    adminWallet : "Select * from user_wallet where user_id =1",
    
    insertContacts  : "insert into contact_us SET ?",
    updatemeta  :"update item SET metadata =? where id=?",
    getContact   : "Select * from contact_us order by id desc",

    getUserDetails  : "SELECT bd.*,it.name,it.edition_type,it.description,it.image,it.file_type,it.owner,it.expiry_date,u.user_name,u.email FROM item_edition_bid as bd LEFT JOIN item_edition as ie on ie.id=bd.item_edition_id left join item as it ON it.id=ie.item_id LEFT JOIN users as u ON u.id = bd.user_id WHERE bd.id=?",
    getitemBy : "SELECT name,description,image,owner,expiry_date FROM item WHERE id=?",
    getTransactionDetail  : "Select i.name as item_name,i.edition_type,i.image,i.file_type,case when ie.transfer_hash is not null then concat('https://mumbai.polygonscan.com/tx/',ie.transfer_hash) else t.receipt_url end as transfer_hash,u.user_name,u.profile_pic,t.*,case when i.edition_type=2 then 'Open' when t.edition_text is not null then t.edition_text else ie.edition_text end as edition_text,abs(t.amount) as amount,date_format(t.datetime,'%d-%M-%y %H:%i:%s') as datetime,case when t.status=0 then 'Pending' when t.status=1 then 'Completed' else 'Rejected' end as status,tc.name as type_name from transaction as t LEFT JOIN item_edition as ie on ie.id=t.item_edition_id LEFT JOIN users as u ON ie.owner_id=u.id left join item as i ON i.id=ie.item_id LEFT JOIN transaction_type as tc ON t.transaction_type_id=tc.id where t.id=? ORDER BY t.id DESC limit 1",
    getTransactionDetail1  : "Select i.name as item_name,i.edition_type,case when i.edition_type=2 then 'Open' when t.edition_text is not null then t.edition_text else ie.edition_text end as edition_text,i.image,i.file_type,case when ie.transfer_hash is not null then concat('https://mumbai.polygonscan.com/tx/',ie.transfer_hash) else t.receipt_url end as transfer_hash,u.user_name,u.profile_pic,t.*,ie.price  as amount,date_format(coalesce(t.datetime,now()),'%d-%M-%y %H:%i:%s') as datetime,case when t.status=2 then 'Rejected' when t.status=1 then 'Completed' else 'Pending' end as status,tc.name as type_name from item_edition as ie left join transaction as t on ie.id=t.item_edition_id  LEFT JOIN users as u ON ie.owner_id=u.id left join item as i ON i.id=ie.item_id LEFT JOIN transaction_type as tc ON t.transaction_type_id=tc.id where ie.id=? ORDER BY t.id DESC limit 1",
    insertEdition : "insert into item_edition SET ?",
    updateItemBid : "update item_edition_bid set status=2  where item_edition_id=? and id<>?",
    updateItemBid2 : "update item_edition_bid set status=1  where  id=?",
    getOnlineTrx : "select *,isResale(item_edition_id)as is_resale from onlinetrx where transaction_id =?",

    allCategoryItem : "Select i.id as item_id,i.edition_type,i.item_category_id,i.price,concat('Edition : ',ie.edition_text) as edition_text, ie.id as item_edition_id,i.image,date_format(COALESCE(i.start_date,CURRENT_DATE),'%Y-%m-%d') as start_date,i.file_type,i.name,i.description from item_edition as ie left join item as i on i.id=ie.item_id where i.item_category_id= ? and i.is_active=1 and ie.is_sold=0 and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id)  and (ie.expiry_date >= now() or ie.expiry_date is null) limit ?",
    getUpcomingNft : "Select i.id as item_id,i.edition_type,i.item_category_id,i.price,concat('Edition : ',ie.edition_text) as edition_text, ie.id as item_edition_id,i.image,date_format(coalesce(i.start_date,CURRENT_DATE),'%Y-%m-%d') as start_date,i.file_type,i.name,i.description from item_edition as ie left join item as i on i.id=ie.item_id where  i.is_active=1 ie.is_sold=0 and ie.id in (select min(id) from item_edition where is_sold=0 group by item_id)and i.start_date>CURRENT_DATE limit ?",
    getSingleUserCollection : "Select id as collection_id,user_id,name,description,nft_type_id from user_collection where id=? and user_id =?",
    updateUserCollection: "update user_collection SET ?  where id=? and user_id =?",
    deleteUserCollection : "Delete from user_collection  where id=?",
    getCollectionItemCount : "select count(id) as itemCount from item where user_collection_id=?",
    
    getCategory : "Select id,name from item_category",
    getDigitalCategory : "Select id,name from item_category where nft_type_id=1",
    getUserDigitalCategory : "Select id,name from item_category where id in (1,2,3)",
    getPendingBid : "select * from item_edition_bid where item_edition_id=? and id <>? order by id desc limit 1",
    additemimages : "insert into item_images SET ?",
    updatePayoutAddress : "update users set ? where id =?"
  
}

