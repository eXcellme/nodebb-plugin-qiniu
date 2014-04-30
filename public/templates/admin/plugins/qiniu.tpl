<h1>Qiniu</h1>
<form class="form">
	<div class="row">
		<div class="col-sm-4 col-xs-12">
			<div class="form-group">
				<label>Qiniu uploadArgs:</label>
				<input id="accessKey" type="text" class="form-control" placeholder="Enter accessKey" value="{accessKey}">
				<input id="secretKey" type="text" class="form-control" placeholder="Enter secretKey" value="{secretKey}">
				<input id="bucketName" type="text" class="form-control" placeholder="Enter bucketName" value="{bucketName}">
				<input id="expireTime" type="text" class="form-control" placeholder="Enter expireTime hours" value="{expireTime}">
			</div>
		</div>
	</div>
</form>
<button class="btn btn-primary" id="save">Save</button>
<script type="text/javascript">
	$('#save').on('click', function() {
		$.post('/api/admin/plugins/qiniu/save', {_csrf : $('#csrf_token').val(), uploadArgs:{accessKey : $('#accessKey').val(),secretKey : $('#secretKey').val(),bucketName : $('#bucketName').val(),expireTime : $('#expireTime').val()}}, function(data) {
			app.alertSuccess(data.message);
		});
		return false;
	});
</script>