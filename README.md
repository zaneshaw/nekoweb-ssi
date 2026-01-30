# nekoweb-ssi

really bad and rushed implementation of nekoweb's new ssi system. can't guarantee this will work with your website (probably won't). things _will_ break.

### supported directives

- include directive
- layout directive
- block directive

## how to use

### executable (recommended)

1. download the [latest release](https://github.com/zaneshaw/nekoweb-ssi/releases/latest)
2. run `ssi-server.exe`, then close it
3. configure the path to your website in `config.json`
4. run `ssi-server.exe` again
5. navigate to https://localhost:3000 by default

### source

1. clone this repo
2. install bun at https://bun.com/docs/installation
3. open a terminal in the repo's directory
4. install dependencies with `bun install`
5. configure the path to your website in `config.json`
6. run the server with `bun run serve`

## configuration

<!-- prettier-ignore -->
| key          | type    | default value                 | description |
|--------------|---------|-------------------------------|-------------|
| port         | number  | 3000                          | the port that the server will run on. you can access your site once the server is running at http://localhost:{PORT} |
| public_path  | string  | "C:\\\\PATH\\\\TO\\\\WEBSITE" | the local path to your website on your computer. this is where your index.html should be |
| pretty_links | boolean | false                         | redirects html pages to a prettified version with the ".html" extension removed (/page.html => /page, /index.html => /) |

## building

```bash
bun run build
```

## known problems

- turning pretty links off will break your site until you clear the cache

## todo

- [ ] unit tests
- [ ] better parsing
- [ ] better validation
- [ ] \_catchall.html
- [ ] render directive
- [ ] error directive
- [ ] list directive
- [ ] variables
