# BOSS Programming Language

forked from [The Mutiverse BOSS](https://github.com/asadrabbi/compiler_design).

<br /><br />

# Pre Requisite

`Clang` and `node 18` is required to run the compiler. In ubuntu,

To install `Clang`

```
sudo apt install clang
```

For `node`, you can always use `nvm`. See [Node Version Manager](https://github.com/nvm-sh/nvm).

And, you should also add the isntalled directory to the `PATH` variable:

```
export PATH="/path/to/cloned/dir/of/boss/:$PATH"
```

<br /><br />

# Usage

Now all you have to do is writing your code in BOSS language, and the code file extension should be `.boss`. You can anytime browse the `examples` folder.

Then, compile your boss code with following command:

```
boss problem.boss
```

This will create an binary output with the same filename of the source code and with `.o` extension. So, for `problem.boss`, the output will be `problem.o`.

Lastly, execute the binary output:

```
./problem.o
```
