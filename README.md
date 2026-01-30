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

## building

```bash
bun run build
```

## todo

- [ ] better parsing
- [ ] better validation
- [ ] \_catchall.html
- [ ] render directive
- [ ] error directive
- [ ] list directive
- [ ] variables
