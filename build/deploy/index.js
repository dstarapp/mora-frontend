import { exec } from 'child_process';
import path from 'path'
import qiniu from 'qiniu'
import fs from 'fs'

const cdnUrl = 'https://assets.mora.services/'
const cwd = path.resolve('../')

const dfx = (isqiniu = false) => {
	const output = exec('dfx deploy --network ic assets', {
		cwd,
	});

	output.stdout.on('data', (data) => {
		console.log(data)
	});

	output.on('close', () => {
		console.log('DFX, End of packing');
		if (isqiniu) {
			console.log('Start uploading CDN');
			qiniuUpload()
		}
	});
}

const getFileType = (filePath) => {
	let startIndex = filePath.lastIndexOf(".");
	if (startIndex !== -1)
		return filePath.substring(startIndex + 1, filePath.length).toLowerCase();
	else return "";
}

const qiniuUpload = () => {
	const accessKey = '5OQhQQLT8FF6ICw_BxfuEN-Uw_xAWR9TETAK5DHE';
	const secretKey = 'rJWA0n7NG75rW9OTcp-KPh5oHOSZ8ZUuo2wWJDQQ';
	const bucket = 'dstar-mora'
	const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	let config = new qiniu.conf.Config();
	config.zone = qiniu.zone.Zone_as0;

	let bucketManager = new qiniu.rs.BucketManager(mac, config);
	let folderName = "assets/";

	const _getFileList = (type) => {
		bucketManager.listPrefix(bucket, {
			limit: 99999,
			prefix: folderName,
		}, (err, respBody, respInfo) => {
			if (err) {
				console.log(err)
			}
			if (respInfo.statusCode == 200) {
				if (type === 'remove') {
					_removeFile(respBody.items)
					_uploadFile()
				}
				if (type === 'mime') {
					_changeFileMime(respBody.items)
				}
			} else {
				console.log(respInfo.statusCode);
				console.log(respBody);
			}
		});
	}

	const _removeFile = (items) => {
		let deleteOperations = []
		items.filter((item) => {
			if (item && item.key !== folderName) {
				deleteOperations.push(qiniu.rs.deleteOp(bucket, item.key))
			}
		});
		if (deleteOperations.length) {
			bucketManager.batch(deleteOperations, (err, respBody, respInfo) => {
				if (err) {
					console.log("History file delete error.");
				} else {
					if (parseInt(respInfo.statusCode / 100) == 2) {
						console.log("History file delete success");
					} else {
						console.log(respInfo.deleteusCode);
						console.log(respBody);
					}
				}
			});
		}
	}

	const _uploadFile = () => {
		const options = {
			scope: bucket,
		};
		let putPolicy = new qiniu.rs.PutPolicy(options);
		let uploadToken = putPolicy.uploadToken(mac);
		console.log(uploadToken)
		const formUploader = new qiniu.form_up.FormUploader(config);
		const putExtra = new qiniu.form_up.PutExtra();
		putExtra.metadata = {
			'content-type': 'application/javascript'
		};
		fs.readdir(path.join(cwd, 'dist', 'assets'), function (err, files) {
			if (err) return console.log('fs', err)
			let num = 0
			const _upload = () => {
				if (files[num]) {
					const localFile = path.join(cwd, 'dist', 'assets', files[num])
					formUploader.putFile(uploadToken, `assets/${files[num]}`, localFile, putExtra, (respErr, respBody, respInfo) => {
						if (respErr) {
							console.log(`assets/${files[num]} upload error, Start trying again!!`)
							_upload()
						}
						if (respInfo.statusCode == 200) {
							console.log(`assets/${files[num]} upload success`)
							num += 1
							_upload()
						} else {
							console.log(`assets/${files[num]} upload error, Start trying again!`)
							_upload()
						}
					});
				} else {
					_getFileList('mime')
					console.log(`cdn upload success, change file mime`)
				}
			}
			_upload()
		})

	}

	const _changeFileMime = (items) => {
		let chgmOperations = []
		items.map(item => {
			if (getFileType(item.key) === 'js') {
				chgmOperations.push(qiniu.rs.changeMimeOp(bucket, item.key, 'application/javascript; charset=UTF-8'))
			}
			if (getFileType(item.key) === 'svg') {
				chgmOperations.push(qiniu.rs.changeMimeOp(bucket, item.key, 'image/svg+xml'))
			}
			if (getFileType(item.key) === 'woff') {
				chgmOperations.push(qiniu.rs.changeMimeOp(bucket, item.key, 'application/font-woff'))
			}
		})

		bucketManager.batch(chgmOperations, (err, respBody, respInfo) => {
			if (err) {
				console.log(err);
			} else {
				if (parseInt(respInfo.statusCode / 100) == 2) {
					console.log("change MIME success");
				} else {
					console.log(respInfo.statusCode);
					console.log(respBody);
				}
			}
		});
	}

	_getFileList('remove')
}

const deploy = (type) => {
	if (type === 'IC') {
		const output = exec('vite build', {
			cwd
		});

		output.stdout.on('data', (data) => {
			console.log(data)
		});

		output.on('close', () => {
			console.log('End of packing, Starting Deployment.');
			dfx()
		});
	}

	if (type === 'CDN') {
		const output = exec(`vite build --base ${cdnUrl}`, {
			cwd
		});

		output.stdout.on('data', (data) => {
			console.log(data)
		});

		output.on('close', () => {
			console.log('End of packing, Starting Deployment.');
			dfx(true)
		});
	}

}

export {
	deploy
}