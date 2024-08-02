---
title: Transaction
lang: en-US
---

# Transaction

More API refer [Orm 增删改查](./orm.md)

There are two ways to handle transaction in Beego. One is closure:

```go
	// Beego will manage the transaction's lifecycle
	// if the @param task return error, the transaction will be rollback
	// or the transaction will be committed
	err := o.DoTx(func(ctx context.Context, txOrm orm.TxOrmer) error {
		// data
		user := new(User)
		user.Name = "test_transaction"

		// insert data
		// Using txOrm to execute SQL
		_, e := txOrm.Insert(user)
		// if e != nil the transaction will be rollback
		// or it will be committed
		return e
	})
```
In this way, the first parameter is `task`, all DB operation should be inside the task.

If the task return error, Beego rollback the transaction.

We recommend you to use this way.

Another way is that users handle transaction manually:

```go
	o := orm.NewOrm()
	to, err := o.Begin()
	if err != nil {
		logs.Error("start the transaction failed")
		return
	}

	user := new(User)
	user.Name = "test_transaction"

	// do something with to. to is an instance of TxOrm

	// insert data
	// Using txOrm to execute SQL
	_, err = to.Insert(user)

	if err != nil {
		logs.Error("execute transaction's sql fail, rollback.", err)
		err = to.Rollback()
		if err != nil {
			logs.Error("roll back transaction failed", err)
		}
	} else {
		err = to.Commit()
		if err != nil {
			logs.Error("commit transaction failed.", err)
		}
	}
```

Either way, it should be noted that only SQL executed via `TxOrm` will be considered to be within a transaction.

```go
o := orm.NewOrm()
to, err := o.Begin()

// outside the txn
o.Insert(xxx)

// inside the txn
to.Insert(xxx)
```

Of course, `QuerySeter` and `QueryM2Mer`, `RawSeter` derived from `TxOrm` are also considered to be inside the transaction.

The methods related to transactions are:

```go
	Begin() (TxOrmer, error)
	BeginWithCtx(ctx context.Context) (TxOrmer, error)
	BeginWithOpts(opts *sql.TxOptions) (TxOrmer, error)
	BeginWithCtxAndOpts(ctx context.Context, opts *sql.TxOptions) (TxOrmer, error)

	// Beego closure
	DoTx(task func(ctx context.Context, txOrm TxOrmer) error) error
	DoTxWithCtx(ctx context.Context, task func(ctx context.Context, txOrm TxOrmer) error) error
	DoTxWithOpts(opts *sql.TxOptions, task func(ctx context.Context, txOrm TxOrmer) error) error
	DoTxWithCtxAndOpts(ctx context.Context, opts *sql.TxOptions, task func(ctx context.Context, txOrm TxOrmer) error) error

```
