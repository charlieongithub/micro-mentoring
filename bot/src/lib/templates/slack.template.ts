export const getAppInstallTemplate = (clientId: string) => {
    return 	`<!DOCTYPE html>
	<html>
		<body>
			<h1>MMA bot install page</h1>
            <a href="https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=calls:read,calls:write,channels:history,channels:read,chat:write,commands,dnd:read,files:read,groups:read,im:history,im:read,im:write,incoming-webhook,mpim:history,mpim:read,mpim:write,pins:write,reactions:read,reactions:write,remote_files:read,remote_files:share,remote_files:write,team:read,users:read,users:read.email,users:write,groups:history&user_scope=identify,im:write,users.profile:read,users:read,users:read.email"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"></a>
		</body>
	</html>`;
};