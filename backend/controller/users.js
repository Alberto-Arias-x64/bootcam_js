const User = require('../model/users')
const bcrypt = require('bcrypt')
const {create_token,decode} = require('../middleware/token')
require('dotenv').config()

function catch_error (error,res) {
    res.status(400).json({code : 'FAIL', ...error}
)}

exports.get_all_users = (req,res) => {
    User.findAll()
    .then(crud => {
        if (crud.length != 0) res.status(200).json(crud)
        else res.status(404).json({code : 'NO CONTENDT'}) // no contendt
    })
    .catch(error => catch_error(error,res))
}

exports.get_user = (req,res) => {
    User.findByPk(req.params.id)
    .then(crud => {
        if (crud.length != 0) {
            const {password_hash,id,name,is_admin,mail,imagen} = crud
            res.status(200).json({id,name,mail,imagen})
        }
        else res.status(404).json({code : 'NO CONTENDT'}) // no contendt
    })
    .catch(error => catch_error(error,res))
}
exports.add_user = async(req,res) => {
    const {name,mail,password} = req.body
    const num = Math.floor((Math.random() * (14 - 1 + 1)) + 1)

    if(name ==='' || mail === '' || password ==='') catch_error({error:'MISSING DATA'},res)
    else{
        let password_hash = {}
        if(password) {password_hash = await bcrypt.hash(password, 10)}
        User.create({name,mail,password_hash,imagen:`tiny/${num}.jpg`})
        .then(crud => {
            const {id,name,mail,is_admin,password_hash,imagen} = crud.dataValues
            const token = create_token({id,is_admin})
            res.status(201).json({id,name,mail,imagen,token})
        }) //created
        .catch(error => catch_error(error,res))
    }
}

exports.update_user = async(req,res) => {
    const {id,name,mail,password} = req.body
    if(name ==='' || mail === '' || password ==='') catch_error({error:'MISSING DATA'},res)
    else{
        let password_hash = {}
        if(password) {password_hash = await bcrypt.hash(password, 10)}
        User.update({name,mail,password_hash},{where : {id}})
        .then(() => {
            req.params.id = id
            this.get_user(req,res)
        })
        .catch(error => catch_error(error,res))
    }
}

exports.delete_user = async(req,res) => {
    const {id} = req.body
    User.destroy({where : {id}})
    .then(crud => {
        if (crud.length != 0) res.status(200).json({code:'USER DELETED'})
        else res.status(404).json({code : 'NO CONTENDT'}) // no contendt
    })
    .catch(error => catch_error(error,res))
}

exports.login = async(req,res) => {
    const {mail,password} = req.body
    try {
        const crud = await User.findOne({where : {mail}})
        if (crud == null) res.status(401).json({code : 'USER OR PASSWORD NO MATCH'})
        else {
            const {password_hash,id,name,is_admin,imagen} = crud
            const validate_password = await bcrypt.compare(password,password_hash)
            const token = create_token({id,is_admin})
            validate_password ? res.status(200).json({code: 'LOGGED',id,token,name,imagen}) : res.status(401).json({code : 'USER OR PASSWORD NO MATCH'})
        }
    } catch (error) {
        catch_error(error,res)
    }
}

exports.login_token = async(req,res) => {
    const {token} = req.body
    try {
        const {id} = decode(token)
        const crud = await User.findByPk(id)
        if (crud == null) res.status(401).json({code : 'USER OR PASSWORD NO MATCH'})
        else {
            const {id,name,imagen} = crud
            res.status(200).json({code: 'LOGGED',id,token,name,imagen})
        }
    } catch (error) {
        catch_error(error,res)
    }
}